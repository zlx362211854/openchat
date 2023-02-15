import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const { createHash } = require("crypto");
const parseString = require('xml2js').parseString;

const encrypt = (algorithm, content) => {
  let hash = createHash(algorithm);
  hash.update(content);
  return hash.digest("hex");
};

export const sha1 = (content) => encrypt("sha1", content);

export default async function (req, res) {
  if (req.method === "GET") {
    return signatureHandler(req, res);
  } else if (req.method === "POST") {
    return messageHandler(req, res);
  }
}

function signatureHandler(req, res) {
  const token = "h2TU5dhmezuy";
  const signature = req.query.signature;
  const timestamp = req.query.timestamp;
  const echostr = req.query.echostr;
  const nonce = req.query.nonce;

  const oriArray = new Array();
  oriArray[0] = nonce;
  oriArray[1] = timestamp;
  oriArray[2] = token;
  oriArray.sort();

  const original = oriArray.join("");
  const sha = sha1(original);

  if (signature === sha) {
    res.send(echostr);
  } else {
    res.send({ message: "error" });
  }
}

function messageHandler(req, res) {
  try {
    var buffer = [];
    //监听 data 事件 用于接收数据
    req.on("data", function (data) {
      buffer.push(data);
    });
    //监听 end 事件 用于处理接收完成的数据
    req.on("end", function () {
      //输出接收完成的数据
      parseString(
        Buffer.concat(buffer).toString("utf-8"),
        { explicitArray: false },
        async function (err, result) {
          if (err) {
            console.log(err);
          } else {
            //打印解析结果
            result = result.xml;
            var toUser = result.ToUserName; //接收方微信
            var fromUser = result.FromUserName; //发送方微信
            //判断是否是事件类型
            if (result.Event) {
              //处理事件类型
              switch (result.Event) {
                case "subscribe":
                  //关注公众号
                  break;
                default:
              }
            } else {
              //处理消息类型
              switch (result.MsgType) {
                case "text":
                  //处理文本消息
                  const completion = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: result.Content,
                    temperature: 0.9,
                    max_tokens: 3000,
                    // logprobs: 0,
                    // top_p: 1,
                    // echo: true,
                    frequency_penalty: 0.0,
                    presence_penalty: 0.6,
                    stop: [' Human:', ' AI:'],
                  });
                  res.send(textMsg(toUser, fromUser, completion.data.result?.choices?.[0]?.text || result.Content))
                  break;
                case "image":
                  //处理图片消息
                  break;
                case "voice":
                  //处理语音消息
                  break;
                case "video":
                  //处理视频消息
                  break;
                case "shortvideo":
                  //处理小视频消息
                  break;
                case "location":
                  //处理发送地理位置
                  break;
                case "link":
                  //处理点击链接消息
                  break;
                default:
              }
            }
          }
        }
      );
    });
  } catch (err) {
    res.send(err);
  }
}


function textMsg(toUser, fromUser, content) {
  let resultXml = "<xml><ToUserName><![CDATA[" + fromUser + "]]></ToUserName>";
  resultXml += "<FromUserName><![CDATA[" + toUser + "]]></FromUserName>";
  resultXml += "<CreateTime>" + new Date().getTime() + "</CreateTime>";
  resultXml += "<MsgType><![CDATA[text]]></MsgType>";
  resultXml += "<Content><![CDATA[" + content + "]]></Content></xml>";
  return resultXml;
}
