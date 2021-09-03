var express = require("express");
var path = require("path");
var fetch = require("node-fetch");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var app = express();

var ATM_arr = [];
var AID_arr = [];
var query = {};
var view = {};

//rendering EJS files
app.use(express.static(__dirname + "/views"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());

//allowing CORS requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//page navigation intersection
app.use("/dashboard/:view", (req, res) => start(req, res));

//by default redirects to transaction page
app.use("/", (req, res) => {
  req.params = {
    view: "transactions",
  };
  start(req, res);
});

function start(req, res) {
  view = navigate_view(req.params.view);
  // generate data for transaction page
  if (view.page == "transactions") {
    //default transaction filters
    if (req.query.date0 == undefined || req.query.date1 == undefined)
      req.query = {
        aidId: null,
        atmId: null,
        date0: 20201105,
        date1: 20201105,
        pan: null,
        txnSerial: null,
      };
    getATMList(req, res);
  } else draw(res, [], [], [], {});
}

//get ATM list
function getATMList(req, res) {
  if (ATM_arr.length == 0)
    fetch("https://dev.cjpf4.net/um/api/jr/txn/atmlist/v1", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => {
        ATM_arr = json;
        getAIDList(req, res);
      });
  else getAIDList(req, res);
}

//get AID list
function getAIDList(req, res) {
  if (AID_arr.length == 0)
    fetch("https://dev.cjpf4.net/um/api/jr/txn/aidlist/v1", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => {
        AID_arr = json.filter((e) => e.name != null);
        getTransactions(req, res);
      });
  else getTransactions(req, res);
}

function getTransactions(req, res) {
  //optional filter data
  var verify = [
    req.query.aidId,
    req.query.atmId,
    req.query.pan,
    req.query.txnSerial,
  ];

  //"null" => null converting
  for (var i = 0; i < verify.length; i++)
    if (verify[i] == "null") verify[i] = null;

  //url paramaters
  query = {
    aidId: verify[0],
    atmId: verify[1],
    pan: verify[2],
    txnSerial: verify[3],
    date0: parseInt(req.query.date0),
    date1: parseInt(req.query.date1),
  };

  //get transaction data
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://dev.cjpf4.net/um/api/jr/txn/v1");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) draw(res, JSON.parse(xhr.responseText));
  };

  //query sent to API
  xhr.send(JSON.stringify(query));
}

//sending data to client
function draw(res, data) {
  res.render("index", {
    view: view,
    atm_list: ATM_arr,
    aid_list: AID_arr,
    dir_path: "../",
    data: data,
    query: query,
  });
}

//navigation
function navigate_view(text) {
  var nav = [
    {
      name: "Transactions",
      value: "transactions",
      icon: "fas fa-random",
    },
    {
      name: "Settings",
      value: "settings",
      icon: "fas fa-sliders-h",
    },
    {
      name: "User management",
      value: "user",
      icon: "fas fa-users",
    },
    {
      name: "ATM management",
      value: "atm",
      icon: "fas fa-cloud",
    },
    {
      name: "My account",
      value: "account",
      icon: "fas fa-user",
    },
  ];
  var view = text;

  //find nav page with text
  var f = false;
  nav.forEach((element) => {
    if (element.value == text) {
      if (text != "transactions") view = "maintainance";
      f = true;
    }
  });

  //not in nav list, show 404
  if (!f) view = "sections/404";

  //view obj in render
  return {
    page: view,
    selected: text,
    nav: nav,
  };
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log("listening to port " + port));
