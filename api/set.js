const pocketdb = require('./pocketdb.js');
module.exports = async (req, res) => {
  function resolve(data, reqdata) {
    if(status >= 400) {
      res.status(status).send(JSON.stringify({
        success: false,
        error: data,
        request: reqdata
      }));
    } else {
      res.status(status).send(JSON.stringify({
        success: true,
        result: data,
        request: reqdata
      }));
    }
  }
  if(
}