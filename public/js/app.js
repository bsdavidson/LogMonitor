// I have no fucking idea what I'm doing...

// Date Shim
if (!Date.now) {
    Date.now = function() {
      return new Date().getTime();
    };
  }

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

  changeLog: function() {
    LR.lastLineCount = 0;
    LR.newLineCount = 0;
    this.updateLog();
  },

  searchChange: function() {
    LR.lastLineCount = 0;
    LR.newLineCount = 0;
  },

  updateLog: function() {
    LR.currentTime = Math.floor(Date.now() / 1000);
    timeElaspsed = LR.currentTime - LR.startTime;

    //console.log('ReRenderLog', this.$el.find('select').val());
    selectedFile = this.$el.find('select').val();
    searchString = this.$el.find('input').val();
    log = this.collection.get(selectedFile);

    log.fetch({

      data: {
        filter: searchString,
        seek: LR.lastFilePos
      },

      success: _.bind(function() {

        logArray = log.get('lines');
        logLen = logArray.length;

        LR.lastFilePos = log.get('lastfilepos');

        if (LR.lastLineCount === 0) {
          LR.lastLineCount = logLen;
          console.log('Reset Count');
        }

        if (LR.lastLineCount < logLen) {

          if ((LR.currentTime - LR.lastNewLineTime) < 20) {
            LR.newLineCount = LR.newLineCount + (logLen - LR.lastLineCount);
          } else {
            LR.newLineCount = logLen - LR.lastLineCount;
          }

          LR.lastLineCount = logLen;
          console.log('Count Change!', LR.newLineCount);
          LR.lastNewLineTime = LR.currentTime;
        }

        this.$el.find('.logblock').html(this.logTemplate({
          log: log
        }));

        // console.log(logArray);
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
      console.log("defaultRoute");
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
},1000);

