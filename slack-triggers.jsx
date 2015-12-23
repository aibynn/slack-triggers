SlackUsers = new Mongo.Collection("slackusers");
SlackUserTriggers = new Mongo.Collection("slackusertriggers");

if (Meteor.isClient) {

  Meteor.startup(function() {    
    ReactDOM.render(<UserList />, document.getElementById("userlist-target"));
    ReactDOM.render(<TriggerInfo />, document.getElementById("userinfo-target"));    
  });
}

  //I think I need to add something onto the server which gets all the data and updates fields,
  //although how will it deal with non-existing whatever? Good question.

  if (Meteor.isServer) {
    Meteor.startup(function(){    
     //Meteor.call("updateUsers");

  });
  
}
