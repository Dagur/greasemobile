// ==UserScript==
// @name        Greasemobile
// @namespace   dagur
// @description Reikna tollinn á mobile.de
// @include     http://suchen.mobile.de/fahrzeuge/details.html*
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==


var tollCategory = function (emission) {
  let ranges = [
    ["87032321", 0, 80],
    ["87032322", 81, 100],
    ["87032323", 101, 120],
    ["87032324", 121, 140],
    ["87032325", 141, 160],
    ["87032326", 161, 180],
    ["87032327", 181, 200],
    ["87032328", 201, 225],
    ["87032329", 226, 250],
    ["87032330", 250, 9000]
  ];
  
  return ranges.find(x => x[1] <= emission && x[2] >= emission)[0];
};

var priceEUR = function () {
  let priceTxt = document
    .getElementsByClassName("rbt-sec-price")[0]
    .textContent;
  return priceTxt.match(/^€(\S+).*/)[1].replace(/,/g,'');  
};

var emission = function () {
  let emissionTxt = document
    .getElementById("rbt-envkv.emission-v")
    .children[0]
    .textContent;
  return emissionTxt.match(/(\d+)\s+g\/km.*$/)[1];  
};

var insertISKPrice = function (total, summaryText, url) {
  let priceElement = document.getElementsByClassName("rbt-sec-price")[0];
  let iskElement = document.createElement('a');
  iskElement.textContent = total;
  iskElement.setAttribute("title", summaryText);
  iskElement.setAttribute("href", url);
  iskElement.setAttribute("target", "_blank");
  iskElement.setAttribute("style", "padding-left: 3px");
  
  priceElement.appendChild(iskElement);    
};

var run = function() {
  let url = 'https://www.tollur.is/einstaklingar/tollamal/reiknivel/uttak/?',
      params = `tollskrarnumer=${tollCategory(emission())}&mynt=EUR&tollverd=${priceEUR()}&stk=1`,
      requrl = url+params; 
    
  GM_xmlhttpRequest({
    method: "GET",
    url: requrl,
    onload: function (response) {      
      let el = document.createElement('html');
      el.innerHTML = response.responseText;        
      let priceTxt = el.getElementsByClassName("lead")[0]
        .textContent
        .replace(/\n/g,'')
        .replace(/\s{2,}/g,' ');
      
      insertISKPrice(priceTxt.match(/^[^=]*=\s+(.*)$/)[1], priceTxt, requrl);
    }
  })    
};


run();
