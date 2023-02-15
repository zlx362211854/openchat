const {createHash}= require('crypto');
/**
 * @param {string} algorithm
 * @param {any} content
 *  @return {string}
 */
const encrypt = (algorithm, content) => {
  let hash = createHash(algorithm)
  hash.update(content)
  return hash.digest('hex')
}
export const sha1 = (content) => encrypt('sha1', content)
export default async function (req, res) {
    var token = "h2TU5dhmezuy";
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var echostr = req.query.echostr;
    var nonce = req.query.nonce;

    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = token;
    oriArray.sort();

    var original = oriArray.join('');
    var sha = sha1(original)

    if (signature === sha) {
        //验证成功
        res.send(echostr)
    } else {
        //验证失败
        res.send({ "message": "error" })
    }

}