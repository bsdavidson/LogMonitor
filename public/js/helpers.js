/*jshint node:true */

(function(LR) {
'use strict';

// var LR = require('./init');

// Date Shim
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  };
}

Array.prototype.clone = function() {
  return this.slice(0);
};

LR.entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

LR.escapeHtml = function(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return LR.entityMap[s];
  });
};

// Function for removing elements from Array
if (!Array.prototype.remove) {
  Array.prototype.remove = function(val, all) {
    var i, removedItems = [];
    if (all) {
      for(i = this.length; i--;){
        if (this[i].indexOf(val) > -1) {
          // console.log('Removing Item');
          removedItems.push(this.splice(i, 1));
        }
      }
    }
    else {  //same as before...
      i = this.indexOf(val);
      if(i>-1) removedItems = this.splice(i, 1);
    }
    return removedItems;
  };
}

}(window.LR));
