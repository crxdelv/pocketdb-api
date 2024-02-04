const pocketdb = require('./pocketdb.js');
module.exports = async (req, res) => {
  function end(status, data) {
    if(status >= 400) {
      res.status(status).send(JSON.stringify({
        success: false,
        error: data
      }));
    } else {
      res.status(status).send(JSON.stringify({
        success: true,
        result: data
      }));
    }
  }
  if(req.query.token != null)
}