// Date Shim
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  };
}

Array.prototype.clone = function() {
  return this.slice(0);
};

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

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

var logCleanup = function() {
  if (LR.logArray.length > 2000) {
    var x = LR.logArray.length - 2000;
    LR.logArray.splice(-1, x);
  }
};

var LR = {
  startTime: Math.floor(Date.now() / 1000),
  currentTime: Math.floor(Date.now() / 1000),
  functionTimer: 0,
  logArray: [],
  lastLineCount: 0,
  lastFilePos: 0,
  lineMatchCount: 0,
  Models: {},
  Collections: {},
  Views: {},
  Templates: {}
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
      collection: this.collection
    }));
    this.updateLog();
  },

  resetLog: function() {
    this.$el.find('#log-table').html('');
    this.$el.find('#loader').show();
    LR.lastLineCount = 0;
    LR.newLineCount = 0;
    LR.logArray = [];
    LR.lastFilePos = 0;
  },

  changeLog: function() {
    this.resetLog();
    this.updateLog();
  },

  filterChange: function() {
    LR.functionTimer = 1;
    $(this.el).removeHighlight();
    LR.filterText = this.$el.find('input').val();
    $('pre').highlight(LR.filterText);
    if (LR.filterText) {
      $('#log-table').addClass('filtered');
    } else {
      $('#log-table').removeClass('filtered');
    }
    LR.lineMatchCount = $('.unhide').length;
  },

  updateLog: function() {
    LR.currentTime = Math.floor(Date.now() / 1000);
    LR.timeElaspsed = LR.currentTime - LR.startTime;
    LR.selectedFile = this.$el.find('select').val();
    LR.pauseRefresh = this.$el.find('#pause-refresh').val();
    LR.lineMatchCount = $('.unhide').length;
    var log = this.collection.get(LR.selectedFile);
    if (LR.functionTimer === 0) {
      log.fetch({
        data: {
          // filter: LR.filterText,
          seek: LR.lastFilePos
        },

        success: _.bind(function() {
          // Add new log entries to the top of our existing array
          LR.logArray.unshift.apply(LR.logArray, log.get('lines'));
          logLen = LR.logArray.length;
          // Update our file position only if its higher than before.
          if (LR.lastFilePos < log.get('lastfilepos')) {
            LR.lastFilePos = log.get('lastfilepos');
          }
          // Setting the count because its the first pass
          // or because we switched files.
          if (LR.lastLineCount === 0) {
            LR.lastLineCount = logLen;
          }

          // The new log Length is greater than what we currently have
          // therefore, we have new entries.
          if (LR.lastLineCount < logLen) {
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
          // Write the log out to the Dom

          if (log.get('lines').length > 0) {
            console.log('New lines');
            this.$el.find('#log-table').prepend(this.logLineTemplate({
              log: log.get('lines')
            }));
          }
          this.$el.find('#loader').hide();
          this.$el.find('#last-line-count').html('# of Matches: ' + LR.lineMatchCount);
          $(this.el).removeHighlight();
          $('pre').highlight(LR.filterText);

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
