// I have no fucking idea what I'm doing...
var LR = {
  Models: {},
  Collections: {},
  Views: {},
  Templates: {}
};


LR.Models.LogEntry = Backbone.Model.extend({});

LR.Collections.LogEntries = Backbone.Collection.extend({
  model: LR.Models.LogEntry,
  url: '/api/v1/log/log.txt',
  initialize: function(){
    console.log('Collection Initialized');
  }
});

LR.Templates.logEntries = _.template($("#tmplt-LogEntries").html());
LR.Views.LogEntries = Backbone.View.extend({
  el: $('.app_container'),
  template: LR.Templates.logEntries,

  initialize: function() {
    _.bindAll(this, "render", "addAll", "addOne");
    this.collection.bind("reset", this.render);
  },

  render: function() {
    console.log("Render View!");
    console.log(this.template());
    console.log(this.collection.length);
    //this.el).html(this.template());
    $(this.el).html(this.collection.length);
    this.addAll();
  },

  addAll: function() {
    //console.log('addAll');
    this.collection.each(this.addOne);
  },

  addOne: function (model) {
    //console.log('addOne');
    view = new LR.Views.LogEntry({ model: model });
    $('ul', this.el).append(view.render());
  }
});

LR.Templates.LogEntry = _.template($('#tmplt-LogEntry').html());

LR.Views.LogEntry = Backbone.View.extend({
  tagName: 'li',
  template: LR.Templates.LogEntry,

  initialize: function() {
    _.bindAll(this, 'render');
  },

  render: function() {
    console.log(this.model.get('line'));
    // console.log("model ");
    return $(this.el).append(this.template(this.model));
  }

});


LR.Router = Backbone.Router.extend({
  routes: {
      "": "defaultRoute"
    },

    defaultRoute: function () {
      console.log("defaultRoute");
      LR.logEntries = new LR.Collections.LogEntries();
      new LR.Views.LogEntries({ collection: LR.logEntries });
      LR.logEntries.fetch();
      console.log(LR.logEntries.length);
    }
});

var appRouter = new LR.Router();
Backbone.history.start();

setInterval(function(){
  LR.logEntries.fetch();
},12000);

