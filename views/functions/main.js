window.onload = () => {
  set_dates();
  _listeners();
  populate_transactions("");
};

function navigate(path) {
  document.getElementById("nav_title_" + path).innerText = "Loading...";
  window.location = "/dashboard/" + path;
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
  var d0 = document.getElementById("date1").value;
  var d1 = document.getElementById("date2").value;
  var atm = document.getElementById("atm_val").value;
  var aid = document.getElementById("aid_val").value;
  var pan = document.getElementById("pan").value;
  var tsn = document.getElementById("tsn").value;

  if (atm == "0") atm = null;
  if (aid == "0") aid = null;
  if (pan == "") pan = null;
  if (tsn == "") tsn = null;

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

  window.location = "/dashboard/transactions?" + query;
}

function populate_transactions(match) {
  var data = JSON.parse(document.getElementById("doit").value);
  var box = document.getElementById("prnt_data");
  box.innerHTML = "";
  console.log(data);

  data.forEach((element) => {
    var double_check = [];

    var cont = document.createElement("tr");
    cont.class = "t_row";

    var date = document.createElement("td");
    date.innerText = formate_date(element.devTime, false, "/");

    var atm = document.createElement("td");
    atm.innerText = element.atmName;
    double_check.push(element.atmName.toString());

    var pan = document.createElement("td");
    pan.innerText = element.pan;
    double_check.push(element.pan.toString());

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

      p1.innerHTML += item.descr;
      p2.innerText = item.code;

      if (item.descr != undefined) double_check.push(item.descr.toString());
      if (item.code != undefined) double_check.push(item.code.toString());

      row.appendChild(p1);
      row.appendChild(p2);
      des.appendChild(row);
    });

    cont.appendChild(date);
    cont.appendChild(atm);
    cont.appendChild(pan);
    cont.appendChild(des);

    //show if item contains 'match' text
    if (test(double_check, match) == true) box.appendChild(cont);
  });
}

function test(text_arr, match) {
  for (var i = 0; i < text_arr.length; i++)
    if (text_arr[i].toLowerCase().search(match.toLowerCase()) != -1) {
      return true;
    }
}
