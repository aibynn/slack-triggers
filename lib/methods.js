var slackGetUsersUrl = "https://slack.com/api/users.list?token=xoxp-2171029180-2686651606-16060790343-afae6db077"	

Meteor.methods({
	updateUsers : function()
	{			
		
			//This should now fill in the god damned collection in mongodb			
			HTTP.call("GET", slackGetUsersUrl, {}, function(error, response){				
				var j = JSON.parse(response.content);
				//console.log(j["members"][0]["id"]);

				for(var i=0; i<j["members"].length;i++)
				{
					var obj = j["members"][i];
					console.log(obj.id);
					SlackUsers.update(obj.id, obj, {upsert : true});		
				}
			});
		},

		updateResponseText : function(responseID, text)
		{		
			//console.log("ResponseID is ", responseID);
			//console.log("Text is ", text);

			var docsupdated = SlackTriggerResponses.update({"_id" : new Mongo.ObjectID(responseID)}, 
				{$set : {"responseText" : text}});

			console.log("RESPONSE docsupdated is: ", docsupdated);
		},

		updateTriggerText : function(userID, triggerTextID, text)
		{
			//console.log("UserID is ", userID);
			//console.log("TriggerTextID is ", triggerTextID);
			//console.log("Text is ", text);

			var docsupdated = SlackUserTriggers.update({"_id" : new Mongo.ObjectID(triggerTextID)}, 
				{$set : {"triggerText" : text}});

			console.log("TRIGGER docsupdated is: ", docsupdated);
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


		console.log("docsupdated is: ", docsupdated);
	}
});