import https from "https";
import fs from "fs";
import path from "path";

export default async function (request, response) {
  const url = request.body.url;
  const name = url.match(/(img-)(.*?)(?=\.)/)?.[2];
  const localPath = path.resolve(__dirname) + `/../../../static/media/${name}.png`;
  await https.get(url, function (req, res) {
    var imgData = "";
    req.setEncoding("binary");
    req.on("data", function (chunk) {
      imgData += chunk;
    });
    req.on("end", function () {
      fs.writeFile(localPath, imgData, "binary", function (err) {
        if (err) {
          console.log("保存出错！", err);
        } else {
          console.log("保存成功!");
          response.status(200).json({
            result: {
              url: `/media/${name}.png`,
            },
          });
        }
      });
    });
  });
}
