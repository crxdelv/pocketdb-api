const pocketdb = require('./pocketdb.js');

const ERR_METHOD = [
  "INVALID_METHOD",
  "GET is the only method accepted for the endpoint /get"
];
const ERR_PARAM = [
  "INCOMPLETE_PARAM",
  "Incomplete parameters. Please view the documentation https://pocketdb-api.vercel.app/docs/get for more information.",
];

module.exports = async (req, res) => {
  function resolve(data, reqdata) {
    res.status(200).send(JSON.stringify({
      success: true,
      result: data,
      request: reqdata
    }));
  }
  function reject([ error, message ], reqdata) {
    res.status(status).send(JSON.stringify({
      success: false,
      error, message,
      request: reqdata
    }));
  }
  if(req.query.key == undefined || req.query.token == undefined) {
    return reject(ERR_PARAM, {});
  }
  if(req.method != "GET") {
    return reject(ERR_METHOD, {
      token: req.query.token,
      key: req.query.key
    });
  }
  
}