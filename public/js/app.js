var LogEntry = Backbone.Model.extend({});

var LogEntries = Backbone.Collection.extend({
  model: LogEntry,
  url: '/api/v1/log/system.log'
});

var logentries = new LogEntries();

var AppView = Backbone.View.extend({
  el: '.app_container',
  initialize: function(){
    logentries.fetch();
  },
  render: function(){

  }
});

var appview = new AppView({});


// logentries.fetch();
logentries.bind('reset', function () { console.log(logentries); });


// var log = new LogEntry({ log_length: 22});


// log.set({log_length: 12});

// log.set({log_length: 45});
