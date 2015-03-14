/*jshint node:true */
/*globals $:false, _:false, Backbone:false */

(function(LR) {
'use strict';

// var LR = require('./init');

LR.logCleanup = function() {
  if (LR.logArray.length > 2000) {
    var x = LR.logArray.length - 2000;
    LR.logArray.splice(-1, x);
  }
};

// Model
LR.Models.Log = Backbone.Model.extend({
  idAttribute: 'filename'
});

// Collection
LR.Collections.Logs = Backbone.Collection.extend({
  model: LR.Models.Log,
  url: '/api/v1/logs',
  initialize: function(){
    console.log('Collection Initialized');
  }
});

// Collection VIEW
LR.Templates.logsSelect = _.template($("#tmplt-LogsSelect").html());

LR.Views.Logs = Backbone.View.extend({
  el: $('.logs-view'),
  template: LR.Templates.logsSelect,
  logLineTemplate: _.template($("#tmplt-LogLinePrepend").html()),

  events: {
    'change select': 'changeLog',
    'keyup #log-filter': 'filterChange'
   },

  initialize: function() {
    this.collection.bind('reset', this.render, this);
    // this.setModel(this.collection.at(0));
  },

  render: function() {
    this.$el.find('.selectblock').html(this.template({
      LR: LR,
      collection: this.collection
    }));
    this.updateLog();
  },

  resetLog: function() {
    this.$el.find('#log-table').html('');
    this.$el.find('#loader').show();
    if (LR.filterText) {
      LR.filterNewEntry = 1;
    }
    LR.lastLineCount = 0;
    LR.newLineCount = 0;
    LR.logArray = [];
    LR.filterArray = [];
    LR.activeLogArray = [];
    LR.lastFilePos = 0;
    LR.lastLineNum = 0;
  },

  changeLog: function() {
    this.resetLog();
    this.updateLog();
  },

  filterChange: function() {
    LR.filterNewEntry = 1;
    LR.functionTimer = 1;
    $(this.el).removeHighlight();
    LR.activeLogArray = [];
    LR.filterText = this.$el.find('input').val();
    $('pre').highlight(LR.filterText);
    if (LR.filterText) {
      $('#table-block').addClass('filtered');
    } else {
      $('#table-block').removeClass('filtered');
    }
    LR.lineMatchCount = LR.filterArray.length;
  },

  updateArrays: function(log) {
     // Add new log entries to the top of our existing array
    LR.newLines = log.get('lines');
    LR.logArray.unshift.apply(LR.logArray, LR.newLines);

    if (LR.newLines.length === 0 && !LR.filterNewEntry) {
      console.log('Nothing to do');
      return;
    }

    if (LR.filterNewEntry) {
      LR.filterArray = [];
      var idxCount = 0;

      console.log('Iterating over ', LR.logArray.length);
      this.$el.find('#loader').show();

      for (var i = 0, y = LR.logArray.length; i < y; i++) {
        var idx = LR.logArray[i]['line'].search(LR.filterText);
        if (idx > -1) {
          LR.filterArray.push(i);
          idxCount++;
        }
      }

      for (var j = 0, z = LR.filterArray.length; j < z; j++) {
          console.log('pushing filtered lines');
          if (j > 200) {
            return;
          }
          var filteredLine = LR.logArray[LR.filterArray[j]];
          LR.activeLogArray.push(filteredLine);
      }

    } else {

      if (LR.newLines.length > 0) {
        console.log('No New FIlter');
        LR.activeLogArray = LR.logArray.slice(0,200);
      }
    }


  },

  updateOffsets: function(log) {
    var logLen = LR.logArray.length;
    LR.lastLineNum = log.get('linecount');
    LR.segmentsLeft = log.get('segments');
    // Update our file position only if its higher than before.
    if (LR.lastFilePos < log.get('lastfilepos')) {
      LR.lastFilePos = log.get('lastfilepos');
      LR.newLinesPresent = true;
    } else {
      LR.newLinesPresent = false;
    }
    // Setting the count because its the first pass or because we switched files.
    if (LR.lastLineCount === 0) {
      LR.lastLineCount = logLen;
    }

    if (LR.newLinesPresent)  {
      // if less 20 seconds have passed, new lines are added to the
      // existing new lines. otherwise, the new lines are the only
      // new line.
      if ((LR.currentTime - LR.lastNewLineTime) < 20) {
        LR.newLineCount = LR.newLineCount + (logLen - LR.lastLineCount);
      } else {
        LR.newLineCount = logLen - LR.lastLineCount;
      }
      LR.lastLineCount = logLen;
      LR.lastNewLineTime = LR.currentTime;
    }
  },

  updateViews: function() {
    // Write the log out to the Dom

    if (LR.newLines.length > 0 || LR.filterNewEntry) {
      this.$el.find('#table-block').html(
        this.logLineTemplate({
          LR: LR,
          log: LR.activeLogArray
      }));
      this.$el.find('#headspace').remove();
      this.$el.find('#tailspace').remove();
      this.$el.find('#log-table').prepend('<tr id="headspace"><td></td></tr>');
      this.$el.find('#log-table').append('<tr id="tailspace"><td></td></tr>');
    }
    this.$el.find('#loader').hide();

    if (LR.filterNewEntry || LR.newLinesPresent) {
      console.log('updating highlights');
      $(this.el).removeHighlight();
      $('pre').highlight(LR.filterText);
      LR.filterNewEntry = 0;
    }
    this.$el.find('#last-line-count').html('# of Matches: ' + LR.lineMatchCount);
  },

  updateLog: function() {
    if (LR.fetchingLogs) {
      return;
    }
    LR.currentTime = Math.floor(Date.now() / 1000);
    LR.timeElaspsed = LR.currentTime - LR.startTime;
    LR.selectedFile = this.$el.find('select').val();
    LR.pauseRefresh = this.$el.find('#pause-refresh').val();
    LR.lineMatchCount = LR.filterArray.length;

    var log = this.collection.get(LR.selectedFile);
    if (LR.functionTimer === 0) {
      LR.fetchingLogs = true;
      log.fetch({
        data: {
          lastline: LR.lastLineNum,
          seek: LR.lastFilePos,
        },
        success: _.bind(function() {
          // TODO: protect against race conditions

          this.updateArrays(log);
          this.updateOffsets(log);
          this.updateViews();
          LR.fetchingLogs = false;
          if (LR.segmentsLeft > 0) {
            LR.logsView.updateLog();
          }
        }, this)
      });
    } else {
      LR.functionTimer = 0;
    }
  }
});


// Router
LR.Router = Backbone.Router.extend({
  routes: {
      "": "defaultRoute"
    },

    defaultRoute: function () {
      LR.logs = new LR.Collections.Logs();
      LR.logsView = new LR.Views.Logs({ collection: LR.logs });
      LR.logs.fetch({
        success: function() {
          console.log(LR.logs.length);
        }
      });
    }
});

var appRouter = new LR.Router();
Backbone.history.start();

setInterval(function(){
  if ($('input#pause-refresh').is(':checked')) {
    console.log('Update Paused');
  } else {
    LR.logsView.updateLog();
  }
}, 1000);

}(window.LR));
