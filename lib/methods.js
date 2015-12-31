//https://github.com/krishamoud/meteor-slack-api

var slackGetUsersUrl = "https://slack.com/api/users.list?token=xoxp-2171029180-2686651606-16060790343-afae6db077"

var token = "xoxp-2171029180-2686651606-16060790343-afae6db077";
var scotttestgroup = "G0HCF026N";

Meteor.methods({
    updateUsers : function()
    {
        SlackAPI.users.list(token, function(err, res){
            res.members.forEach(function(obj){
                SlackUsers.update(obj.id, obj, {upsert : true});
            });

            //for(var i=0; i<res.members.length;i++)
            //{
            //	var obj = res["members"][i];
            //	console.log(obj.id);
            //	SlackUsers.update(obj.id, obj, {upsert : true});
            //}
        });

        //This should now fill in the god damned collection in mongodb
        // HTTP.call("GET", slackGetUsersUrl, {}, function(error, response){
        // 	var j = JSON.parse(response.content);
        // 	//console.log(j["members"][0]["id"]);

        // 	for(var i=0; i<j["members"].length;i++)
        // 	{
        // 		var obj = j["members"][i];
        // 		console.log(obj.id);
        // 		SlackUsers.update(obj.id, obj, {upsert : true});
        // 	}
        // });
    },

    removeUser: function(userID){
        var docsupdated = SlackUsers.remove(userID);
        console.log("User removed : ", docsupdated);
    },
    removeTrigger : function(triggerID){
        var docsupdated = SlackUserTriggers.remove(new Mongo.ObjectID(triggerID));
        console.log("Trigger removed : ", docsupdated);
    },
    removeResponse : function(responseID){
        var docsupdated = SlackTriggerResponses.remove(new Mongo.ObjectID(responseID));
        console.log("Response removed : ", docsupdated);
    },


    updateResponseText : function(responseID, text)
    {
        //console.log("ResponseID is ", responseID);
        //console.log("Text is ", text);

        var docsupdated = SlackTriggerResponses.update({"_id" : new Mongo.ObjectID(responseID)},
            {$set : {"responseText" : text}});
    },

    updateTriggerText : function(userID, triggerTextID, text)
    {
        //console.log("UserID is ", userID);
        //console.log("TriggerTextID is ", triggerTextID);
        //console.log("Text is ", text);

        var docsupdated = SlackUserTriggers.update({"_id" : new Mongo.ObjectID(triggerTextID)},
            {$set : {"triggerText" : text}});
    },

    updateTriggerText_orig : function(userID, triggerTextID, text)
    {
        //https://groups.google.com/forum/#!topic/meteor-talk/jM5d5n8vTKs
        //console.log("UserID is ", userID);
        //console.log("TriggerTextID is ", triggerTextID);
        //console.log("Text is ", text);

        var update = {
            "_id" : userID,
            "triggers._id": new Mongo.ObjectID(triggerTextID)
        };

        //var docsupdated = SlackUsers.update(update, {$set : {"triggers.$" : {triggerText : text}}});
        var docsupdated = SlackUsers.update({"_id" : userID,
                "triggers._id": new Mongo.ObjectID(triggerTextID)},
            {$set : {"triggers.$.triggerText" : text}});
    },
    testSlack: function(){
        SlackAPI.api.test({"good":1}, function(err,res){
            console.log(err);
            console.log(res);
        });

        var stid = "G0HCF026N"; //Scotttest group id
        SlackAPI.chat.postMessage(token,stid, "Test message", {"as_user": true});
    },

    //When these are updated, we should reload everything for the monitoring.
    startMonitoring : function(){

        SlackUserTriggers.after.insert(function(userid, doc){
            console.log("Trigger updated");
            console.log(doc);
        });

        SlackTriggerResponses.after.insert(function(userid, doc){
            console.log("Trigger response changed");
            console.log(doc);
        });

        //How to check for actual channels/users?


        SlackAPI.rtm.start(token, function(err, response) {
            console.log("start error is : ", err);
            console.log("Websocket is ", response.url);

            var WebSocketClient = Meteor.require("websocket").client;
            var client = new WebSocketClient();
            var stid = "G0HCF026N"; //Scotttest group id
            var username = "Meteor Test Bot";

            client.on('connectFailed', function(error) {
                console.log('Connect Error: ' + error.toString());
            });

            client.on('connect', Meteor.bindEnvironment(function(connection) {
                console.log('WebSocket Client Connected');
                connection.on('error', function(error) {
                    console.log("Connection Error: " + error.toString());
                });

                connection.on('close', function() {
                    console.log('echo-protocol Connection Closed');
                });

                //All of this needs to be pulled from the triggers, with everything else.
                //Do I look it up immediately? Store it? Cache it? Let's see how it works.
                connection.on('message', Meteor.bindEnvironment(function(message) {
                    if (message.type === 'utf8') {
                        var obj = JSON.parse(message.utf8Data);

                        if (obj.type && obj.type == "message") {
                            if (obj.channel && obj.channel == stid) {
                                if (!obj.username || (obj.username && obj.username != username )) {

                                    var r = checkUser(obj);

                                    if (r) {
                                        SlackAPI.chat.postMessage(token, stid, r, {
                                            "as_user": false,
                                            "username": username
                                        });
                                        console.log("Trying to send chat here");
                                    }
                                }
                            }
                            console.log("Received: '" + message.utf8Data + "'");
                        }
                    }
                }));
            }));

            client.connect(response.url);

        });
    }
});

//
function checkUser(obj){

    var words = obj.text.toLowerCase().split(" ");
    console.log("Words are ", words);

    //Get all of the triggers
    var triggers = SlackUserTriggers.find({"userID" : obj.user}).fetch();
    var result = "";

    triggers.forEach(function(trigger){
        console.log("Trigger is", trigger);
        var trigSplit = trigger.triggerText.toLowerCase().split(" ");

        var rr = intersection(words, trigSplit);
        if (rr.length > 0) {
            //Found a match, should get random response
            var responses = SlackTriggerResponses.find({"triggerID": trigger._id._str}).fetch();
            var randRes = responses.randomElement().responseText;
            console.log("Random response is: ", randRes);
            result = randRes;
        }
    });
return result;
}

function intersection(array1, array2){
    return (array1.filter(function(n) {
        return array2.indexOf(n) != -1
    }));
}

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

