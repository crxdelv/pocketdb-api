const pocketdb = require('./pocketdb.js');

const ERR_METHOD = [
  "INVALID_METHOD",
  "POST is the only method accepted for the endpoint /set"
];
const ERR_PARAM = [
  "INCOMPLETE_PARAM",
  "Incomplete parameters. Please view the documentation https://github.com/creuserr/pocketdb-api/blob/main/README.md#documentation for more information.",
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
  if(req.query.key == undefined) {
    return reject(ERR_PARAM, {
      token: req.query.token
    });
  }
  if(req.method != "POST") {
    return reject(ERR_METHOD, {
      token: req.query.token,
      key: req.query.key
    });
  }
  if(req.query.token == undefined) {
    // new database
    try {
      var db = await pocketdb();
      await db.set(req.query.key, JSON.parse(req.body));
      return resolve({
        list: db.list,
        token: db.token
      }, {
        key: req.query.key,
        value: JSON.parse(req.body),
        endpoint: "/set"
      });
    } catch(e) {
      return reject(["INTERNAL_ERROR", e.toString()], {
        key: req.query.key,
        endpoint: "/set"
      });
    }
  } else {
    // load database
    try {
      var db = await pocketdb(req.query.token);
      await db.set(req.query.key, JSON.parse(req.body));
      return resolve({
        list: db.list,
      }, {
        key: req.query.key,
        token: req.query.token,
        value: JSON.parse(req.body),
        endpoint: "/set"
      });
    } catch(e) {
      return reject(["INTERNAL_ERROR", e.toString()], {
        token: req.query.token,
        key: req.query.key,
        endpoint: "/set"
      });
    }
  }
}