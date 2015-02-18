// I have no fucking idea what I'm doing...

// Date Shim
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  };
}

Array.prototype.clone = function() {
  return this.slice(0);
};

// Function for removing elements from Array
if (!Array.prototype.remove) {
  Array.prototype.remove = function(val, all) {
    var i, removedItems = [];
    if (all) {
      for(i = this.length; i--;){
        if (this[i].indexOf(val) > -1) {
          console.log('Removing Item');
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
// ex var removedItems = a.remove(2);
//    a = [1,3,2,4], removedItems = [2];

var LR = {
  startTime: Math.floor(Date.now() / 1000),
  currentTime: Math.floor(Date.now() / 1000),
  logArray: [],
  lastLineCount: 0,
  lastFilePos: 0,
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
  logTemplate: _.template($("#tmplt-LogLines").html()),

  events: {
    'change select': 'changeLog',
    'keyup #log-search': 'searchChange'
   },

  initialize: function() {
    this.collection.bind('reset', this.render, this);
    // this.setModel(this.collection.at(0));
  },

  render: function() {
    console.log('Render time!');
    this.$el.find('.selectblock').html(this.template({
      collection: this.collection
    }));
    this.updateLog();

  },

  resetLog: function() {
    LR.lastLineCount = 0;
    LR.newLineCount = 0;
    LR.logArray = [];
    LR.lastFilePos = 0;
  },

  changeLog: function() {
    this.resetLog();
    this.updateLog();
  },

  searchChange: function() {
    this.resetLog();
    LR.filterText = this.$el.find('input').val();
    var clonedLog = LR.logArray.clone();
    LR.filteredLog = clonedLog.remove(LR.filterText, true);
    console.log('Filtered', LR.filteredLog);
    console.log(LR.filteredLog.length);
  },

  updateLog: function() {
    LR.currentTime = Math.floor(Date.now() / 1000);
    timeElaspsed = LR.currentTime - LR.startTime;

    //console.log('ReRenderLog', this.$el.find('select').val());
    selectedFile = this.$el.find('select').val();
    //searchString = this.$el.find('input').val();
    log = this.collection.get(selectedFile);

    log.fetch({

      data: {
        filter: LR.filterText,
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
        this.$el.find('.logblock').html(this.logTemplate({
          log: LR.logArray
        }));

        this.$el.find('#last-line-count').html('# of Matches: ' + logLen);

      }, this)
    });
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
  LR.logsView.updateLog();
},63000);

