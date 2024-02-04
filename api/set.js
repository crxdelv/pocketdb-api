const pocketdb = require('./pocketdb.js');
module.exports = async (req, res) => {
  function resolve(data, reqdata) {
    res.status(status).send(JSON.stringify({
      success: true,
      result: data,
        request: reqdata
    }));
  }
  function reject(status, error, message, reqdata) {
    res.status(status).send(JSON.stringify({
       success: true,
        result: data,
        request: reqdata
      }));
  }
    if(status >= 400) {
      res.status(status).send(JSON.stringify({
        success: false,
        error: data,
        request: reqdata
      }));
    } else {
      
    }
  }
  if(
}