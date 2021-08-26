var express = require("express");
var path = require("path");
var fetch = require("node-fetch");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var app = express();

app.use(express.static(__dirname + "/views"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//main page
app.use("/dashboard/:view", async (req, res) => {
  var view = navigate_view(req.params.view);
  draw(res, [], [], [], {}, view);
  //generate data for transaction page
  if (view.page == "transactions") {
    //default transaction filters
    if (req.query.date0 == undefined) {
      req.query = {
        aidId: 0,
        atmId: 0,
        date0: 20201105,
        date1: 20201105,
        pan: "",
        txnSerial: "",
      };
    }
    getATMList(req, res, view);
  } else draw(res, [], [], [], {}, view);
});

//get ATM list
function getATMList(req, res, view) {
  fetch("https://dev.cjpf4.net/um/api/jr/txn/atmlist/v1", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((json) => getAIDList(req, res, json, view));
}

//get AID list
function getAIDList(req, res, atm_list, view) {
  fetch("https://dev.cjpf4.net/um/api/jr/txn/aidlist/v1", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((json) => getTransactions(req, res, json, atm_list, view));
}

function getTransactions(req, res, AID, ATM, view) {
  //url paramaters. senting in body
  var query = {
    aidId: req.query.aid,
    atmId: req.query.atm,
    date0: req.query.date0,
    date1: req.query.date1,
    pan: req.query.pan,
    txnSerial: req.query.tsn,
  };

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://dev.cjpf4.net/um/api/jr/txn/v1");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4)
      draw(res, ATM, AID, JSON.parse(xhr.responseText), query, view);
  };
  xhr.send(JSON.stringify(query));
}

//sending data to client
function draw(res, atms, aids, data, query, view) {
  res.render("index", {
    view: view,
    atm_list: atms,
    aid_list: aids,
    dir_path: "../",
    data: data,
    query: query,
  });
}

//page user is viewing
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
  var f = false;
  nav.forEach((element) => {
    if (element.value == text) {
      if (text != "transactions") view = "maintainance";
      f = true;
    }
  });

  if (!f) view = "sections/404";

  return {
    page: view,
    selected: text,
    nav: nav,
  };
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log("listening to port " + port));

// [
//   {
//     date: "11/11/2012",
//     atm_id: "TT1121",
//     PAN: "2134",
//     des: "card inserted",
//     code: "transaction 3124",
//   },
// ]

// var hold = [],
// aid = JSON.parse(AIDList);
// aid.forEach((element) => {
// if (element.type == "EMV") hold.push(element);
// });
// draw(res, atm_list, hold, view);
