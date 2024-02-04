const pocketdb = require('./pocketdb.js');
module.exports = async (req, res) => {
  function end(status, data) {
    if(status >= 400) {
      res.status(status).send(JSON.stringify({}));
    }
  }
  if(req.query.token != null)
}