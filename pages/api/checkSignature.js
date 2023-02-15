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

async function messageHandler(req, res) {
    const xmlData = await getUserDataAsync(req)
    console.log(xmlData);
     //解析xml数据
     const jsData = await parseXMLAsync(xmlData)
     //格式化数据
     const message = formatMessage(jsData)
     console.log(message);
     if(message.MsgType==='text'){
        res.send(textMsg('hello world'))
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


function getUserDataAsync(req) {
    return new Promise((resolve, reject) => {
      let xmlData = ''
      req.on('data', data => {
        //
        console.log(data);
        xmlData += data.toString()
      })
        .on('end', () => {
          //当数据接收完毕，会触发当前函数
          resolve(xmlData)
        })
    })
  }
  function parseXMLAsync(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, { trim: true }, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject('parseXMLtoJS' + err)
        }
      })
    })
  }
function formatMessage(jsData) {
    let message = {}
    //获取xml对象
    jsData = jsData.xml
    //判断是否是一个对象
    if (typeof jsData === 'object') {
      //遍历对象
      for (let key in jsData) {
        let value = jsData[key]
        if (Array.isArray(value) && value.length > 0) {
          message[key] = value[0]
        }
      }
    }
    return message
  }