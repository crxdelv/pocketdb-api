const pocketdb = require('./pocketdb.js');
module.exports = async (req, res) => {
  function resolve(data, reqdata) {
    res.status(200).send(JSON.stringify({
      success: true,
      result: data,
      request: reqdata
    }));
  }
  function reject(status, error, message, reqdata) {
    res.status(status).send(JSON.stringify({
      success: false,
      error, message,
      request: reqdata
    }));
  }
  if(req.method != "POST") {
    return reject(400, );
  }
}