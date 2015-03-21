/*jshint browser:true */

(function() {
  'use strict';

  var LR = window.LR = {
    startTime: Math.floor(Date.now() / 1000),
    currentTime: Math.floor(Date.now() / 1000),
    functionTimer: 0,
    logArray: [],
    filterArray: [],
    newFilteredLines: [],
    headLogArray: [],
    filterText: '',
    activeLogArray: [],
    newLinesPresent: false,
    segmentsLeft: 0,
    lastLineCount: 0,
    lastLineNum: 0,
    lastFilePos: 0,
    lineMatchCount: 0,
    fetchingLogs: false,
    logTail: false,
    Models: {},
    Collections: {},
    Views: {},
    Templates: {}
  };
}());
