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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  function resolve(data, reqdata) {
    res.status(200).send(JSON.stringify({
      success: true,
      result: data,
      request: reqdata
    }));
  }
  function reject([ error, message ], reqdata) {
    res.status(400).send(JSON.stringify({
      success: false,
      error, message,
      request: reqdata
    }));
  }
  if(req.query.key == undefined || req.query.token == undefined) {
    return reject(ERR_PARAM, {
      token: req.query.token,
      key: req.query.key,
      endpoint: "/get"
    });
  }
  if(req.method != "GET") {
    return reject(ERR_METHOD, {
      token: req.query.token,
      key: req.query.key,
      endpoint: "/get"
    });
  }
  try {
    var db = await pocketdb(req.query.token);
    var data = await db.get(req.query.key);
    return resolve({
      list: db.list, data
    }, {
      token: req.query.token,
      key: req.query.key,
      endpoint: "/get"
    });
  } catch(e) {
    return reject(["INTERNAL_ERROR", e.toString()], {
      token: req.query.token,
      key: req.query.key,
      endpoint: "/get"
    });
  }
}