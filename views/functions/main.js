var db = (AID_list = []);

window.onload = () => {
  var url = new URL(window.location.href).pathname;
  if (url.search("transactions") != -1 || url == "/") {
    set_dates();
    _listeners();
    init();
    populate_transactions("");
  }
};

//switch pages
function navigate(path) {
  document.getElementById("nav_title_" + path).innerText = "Loading...";
  window.location = "/dashboard/" + path;
}

//stores db locally, to filter in search
function init() {
  db = JSON.parse(document.getElementById("data_list_storage").value);
  AID_list = JSON.parse(document.getElementById("aid_list_storage").value);
  console.log(db);
}

//formating dates for display or db requests
function formate_date(d, sendable_type, seperate) {
  if (sendable_type) return d.split("-").join("");
  else {
    var y = d.toString().substring(0, 4);
    var m = d.toString().substring(4, 6);
    var d = d.toString().substring(6, 8);

    if (seperate == "-") return y + seperate + m + seperate + d;
    else return m + seperate + d + seperate + y;
  }
}

//setting dates from db
function set_dates() {
  var d0 = document.getElementById("stor_date_0").value;
  var d1 = document.getElementById("stor_date_1").value;
  document.getElementById("date1").value = formate_date(d0, false, "-");
  document.getElementById("date2").value = formate_date(d1, false, "-");
}

function _listeners() {
  var d = document;

  //search box. filter
  d.getElementById("search_t_results").addEventListener("input", (data) =>
    populate_transactions(data.target.value)
  );

  //get transactions when filters change
  d.getElementById("date1").addEventListener("change", getTraansactions);
  d.getElementById("date2").addEventListener("change", getTraansactions);
  d.getElementById("atm_val").addEventListener("change", getTraansactions);
  d.getElementById("pan").addEventListener("blur", getTraansactions);
  d.getElementById("aid_val").addEventListener("change", getTraansactions);
  d.getElementById("tsn").addEventListener("blur", getTraansactions);

  //'not implemented' popup window. Print & Export
  d.getElementById("data_print_btn").addEventListener("click", () =>
    open_popup("Print")
  );
  d.getElementById("data_exp_btn").addEventListener("click", () =>
    open_popup("Export")
  );
  function open_popup(text) {
    d.getElementById("pop_text").innerText = text + " Not Implemented";
    d.getElementById("popup").style.display = "block";
    d.getElementById("popup").style.display = "block";
    d.getElementById("main").style.filter = "blur(2px)";
    d.getElementsByTagName("header")[0].style.filter = "blur(2px)";
  }

  //close popup window
  d.getElementById("pop_bg").addEventListener("click", () => {
    d.getElementById("popup").style.display = "none";
    d.getElementById("main").style.filter = "none";
    d.getElementsByTagName("header")[0].style.filter = "none";
  });
}

function getTraansactions() {
  var d = document;
  var d0 = d.getElementById("date1").value;
  var d1 = d.getElementById("date2").value;
  var atm = d.getElementById("atm_val").value;
  var aid = d.getElementById("aid_val").value;
  var pan = d.getElementById("pan").value;
  var tsn = d.getElementById("tsn").value.replace(/\D/g, "");

  if (atm == "0") atm = null;
  if (aid == "0") aid = null;
  if (pan == "") pan = null;
  if (tsn == "") tsn = null;

  if (d0 != "" && d1 != "") {
    var data = {
        date0: formate_date(d0, true, ""),
        date1: formate_date(d1, true, ""),
        atmId: atm,
        aidId: aid,
        pan: pan,
        txnSerial: tsn,
      },
      query = Object.entries(data)
        .map(([key, val]) => `${key}=${val}`)
        .join("&");

    d.getElementById("t_controls").style.display = "none";
    d.getElementById("t_loading").style.display = "flex";
    window.location = "/dashboard/transactions?" + query;
  } else d.getElementById("t_dates").style.border = "2px solid red";
}

function populate_transactions(match) {
  var box = document.getElementById("prnt_data");
  box.innerHTML = "";

  var emptyPrint = document.getElementById("prnt_empty");
  emptyPrint.innerHTML = "";

  db.forEach((element) => {
    var filter_arr = [];

    var cont = document.createElement("tr");
    cont.class = "t_row";
    cont.title = add_AID_title(element.aid);

    var date = document.createElement("td");
    var dd = formate_date(element.devTime, false, "/");
    date.innerText = dd;
    filter_arr.push(dd);

    var atm = document.createElement("td");
    atm.innerText = element.atmName;
    filter_arr.push(element.atmName.toString());

    var pan = document.createElement("td");
    pan.innerText = element.pan;
    filter_arr.push(element.pan.toString());

    var des = document.createElement("td");
    des.colSpan = "2";

    element.lines.forEach((item) => {
      var row = document.createElement("div"),
        p1 = document.createElement("p"),
        p2 = document.createElement("p");
      row.id = "t_desrc";

      if (item.alert == "ERROR") {
        row.className = "t_alert";
        p1.innerHTML += '<i class="fas fa-exclamation-circle fa-2x">';
      }

      if (item.descr != undefined) {
        p1.innerHTML += item.descr;
        filter_arr.push(item.descr.toString());
      }
      if (item.code != undefined) {
        p2.innerText = item.code;
        filter_arr.push(item.code.toString());
      }

      row.appendChild(p1);
      row.appendChild(p2);
      des.appendChild(row);
    });

    cont.appendChild(date);
    cont.appendChild(atm);
    cont.appendChild(pan);
    cont.appendChild(des);

    //show if item contains 'match' text
    if (test(filter_arr, match)) box.appendChild(cont);
  });

  //empty results animation
  if (box.childElementCount <= 0) {
    var i = document.createElement("i");
    i.className = "far fa-folder-open fa-5x";

    var p = document.createElement("p");
    p.innerHTML = "<br /><br />No Results to be found";

    emptyPrint.appendChild(i);
    emptyPrint.appendChild(p);
  }
}

//filter via containing text
function test(text_arr, match) {
  for (var i = 0; i < text_arr.length; i++)
    if (text_arr[i].toLowerCase().search(match.toLowerCase()) != -1)
      return true;
}

//add title to tr item
function add_AID_title(aid) {
  for (var i = 0; i < AID_list.length; i++)
    if (AID_list[i].id == aid)
      return (
        AID_list[i].descr +
        ": Vendor: #" +
        AID_list[i].vendor +
        ": Country: " +
        AID_list[i].country
      );

  return "";
}
