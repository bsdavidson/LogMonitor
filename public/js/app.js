// I have no fucking idea what I'm doing...
var LR = {
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

/*
log.fetch({
  data: {
    filter: 'xxx'
  }
});
*/

LR.Views.Logs = Backbone.View.extend({
  el: $('.logs-view'),
  template: LR.Templates.logsSelect,
  logTemplate: _.template($("#tmplt-LogLines").html()),

  events: { 'change select': 'updateLog' },

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

  updateLog: function() {
    console.log('ReRenderLog', this.$el.find('select').val());
    selectedFile = this.$el.find('select').val();
    searchString = this.$el.find('input').val();
    log = this.collection.get(selectedFile);
    log.fetch({
      data: {
        filter: searchString
      },
      success: _.bind(function() {
        logArray = log.get('lines');
        this.$el.find('.logblock').html(this.logTemplate({
          log: log
        }));
        // console.log(logArray);
        this.$el.find('#last-line-count').html('# of Matches: ' + logArray.length);
      }, this)
    });

  }

  // setModel: function(model) {
  //   this.model = model;
  //   if (this.model) {
  //     this.model.bind('reset', this.render);
  //   }
  //   this.render();
  // }
});


// Router
LR.Router = Backbone.Router.extend({
  routes: {
      "": "defaultRoute"
    },

    defaultRoute: function () {
      console.log("defaultRoute");
      // LR.logEntries = new LR.Collections.LogEntries();
      LR.logs = new LR.Collections.Logs();
      // new LR.Views.LogEntries({ collection: LR.logEntries });
      LR.logsView = new LR.Views.Logs({ collection: LR.logs });
      //LR.logEntries.fetch();
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

