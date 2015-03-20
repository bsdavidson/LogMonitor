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
    initialize: function() {
      console.log('Collection Initialized');
    }
  });

  // Collection VIEW
  LR.Templates.logsSelect = _.template($('#tmplt-LogsSelect').html());
  LR.Templates.logRenderComplete = _.template($('#tmplt-LogComplete').html());
  LR.Templates.logRenderPrepend = _.template($('#tmplt-LogPrepend').html());

  LR.Views.Logs = Backbone.View.extend({
    el: $('.logs-view'),
    selectLog: LR.Templates.logsSelect,
    logComplete: LR.Templates.logRenderComplete,
    logPrepend: LR.Templates.logRenderPrepend,

    events: {
      'change select': 'changeLog',
      'keyup #log-filter': 'filterChange'
    },

    initialize: function() {
      this.collection.bind('reset', this.render, this);
    },

    render: function() {
      this.$el.find('.selectblock').html(this.selectLog({
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
      LR.filterNewEntry = true;
      LR.functionTimer = 1;
      $('#table-block').html('');
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

    updateFilterArray: function(inputarray, filterText) {
      if (!filterText) {
        return;
      }
      var output = [];
      var idxCount = 0;
      for (var i = 0, y = inputarray.length; i < y; i++) {
        var idx = inputarray[i].line.search(LR.filterText);
        if (idx > -1) {
          output.push(i);
          idxCount++;
        }
      }
      console.log('output', output);
      return output;
    },

    updateActiveArray: function(sourcearray, filterarray, targetarray) {
      for (var i = 0, y = filterarray.length; i < y; i++) {
        console.log('pushing filtered lines');
        if (i > 200) {
          return;
        }
        var filteredLine = sourcearray[filterarray[i]];
        targetarray.push(filteredLine);
      }
    },

    updateArrays: function(log) {
       // Add new log entries to the top of our existing array
      LR.newLines = log.get('lines');
      LR.logArray.unshift.apply(LR.logArray, LR.newLines);
      LR.newFilteredLines = [];
      if (LR.newLines.length === 0 && !LR.filterNewEntry) {
        return;
      }

      if (LR.filterText) {
        var filter;
        if (LR.newLines.length > 0) {
          console.log('new Filtered lines');
          filter = this.updateFilterArray(
            LR.newLines, LR.filterText
            );
          this.updateActiveArray(LR.newLines, filter, LR.newFilteredLines);
        } else {
          console.log('No new Filtered Lines');
          filter = this.updateFilterArray(LR.logArray, LR.filterText);

        }
        console.log(filter);
        this.updateActiveArray(LR.logArray, filter, LR.activeLogArray);
      } else {
        LR.activeLogArray = LR.logArray.slice(0, 200);
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
      if (LR.lastLineCount === 0) {
        LR.lastLineCount = logLen;
      }

      if (LR.newLinesPresent) {
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
      var incomingLinesArray;
      if (LR.newLines.length > 0 || LR.filterNewEntry) {
        var logTable = document.getElementById('log-table');
        if (this.$el.find('#log-table').length > 0) {
          if(LR.newFilteredLines.length > 0) {
            console.log('Filtered Lines');
            incomingLinesArray = LR.newFilteredLines;
          } else if(!LR.filterText) {
            incomingLinesArray = LR.newLines;
          } else {
            return;
          }
          console.log('Prepending', incomingLinesArray);
          this.$el.find('#log-table').prepend(
            this.logPrepend({
              LR: LR,
              log: incomingLinesArray
            }));

          while(logTable.rows.length > 200) {
            // console.log('Deleting Rows');
            logTable.deleteRow(-1);
          }


        } else {
          console.log('Log ReWrite');
          this.$el.find('#table-block').html(
            this.logComplete({
              LR: LR,
              log: LR.activeLogArray
            }));
        }

        this.$el.find('#headspace').remove();
        this.$el.find('#tailspace').remove();
        this.$el.find('#log-table').prepend(
          '<tr id="headspace"><td></td></tr>'
          );
        this.$el.find('#log-table').append(
          '<tr id="tailspace"><td></td></tr>'
          );
      }
      this.$el.find('#loader').hide();

      if (LR.filterNewEntry || LR.newLinesPresent) {
        console.log('updating highlights');
        $(this.el).removeHighlight();
        $('pre').highlight(LR.filterText);
        LR.filterNewEntry = 0;
      }
      this.$el.find('#last-line-count').html(
        '# of Matches: ' + LR.lineMatchCount
        );
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
          if (LR.segmentsLeft === 0) {
            this.updateViews();
          }
          LR.fetchingLogs = false;
          if (LR.segmentsLeft > 0) {
            // Perform Immediate refresh if there are segments left.
            this.$el.find("#count").html(LR.segmentsLeft);
            LR.logsView.updateLog();
          }
        }, this)
      });
    }
  });

// Router
  LR.Router = Backbone.Router.extend({
    routes: {
        '': 'defaultRoute'
      },
      defaultRoute: function() {
        LR.logs = new LR.Collections.Logs();
        LR.logsView = new LR.Views.Logs({collection: LR.logs});
        LR.logs.fetch({
          success: function() {
            console.log(LR.logs.length);
          }
        });
      }
    });

  var appRouter = new LR.Router();
  Backbone.history.start();

  setInterval(function() {
    if ($('input#pause-refresh').is(':checked')) {
      return;
    } else {
      LR.logsView.updateLog();
    }
  }, 1000);
}(window.LR));
