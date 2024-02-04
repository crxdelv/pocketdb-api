const pocketdb = require('./pocketdb.js');

const ERR_METHOD = [
  "INVALID_METHOD",
  "GET is the only method accepted for the endpoint /get"
];
const ERR_PARAM = [
  "INCOMPLETE_PARAM",
  "Incomplete parameters. Please view the documentation https://pocketdb-api.vercel.app/docs/get for more information.",
];