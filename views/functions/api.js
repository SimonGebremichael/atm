var fetch = require("node-fetch");

function start(url) {
  fetch(url, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((json) => {
      return json;
    });
}

module.exports = {
  start: start,
};
