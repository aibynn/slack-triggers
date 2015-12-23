TriggerInfo = React.createClass({
	displayName: 'Slack Trigger Info',

	mixins : [ReactMeteorData],		

	getInitialState () {		
		return ({
			text: '',
			editing: false			
		});
	},

	componentDidMount() {				
		//This gets called via flux, when an object is clicked on
		Dispatcher.register(function(payload){		
			this.setState({userObj : payload.data});			
		}.bind(this));
		//http://stackoverflow.com/questions/31045716/react-this-setstate-is-not-a-function

	},

	getMeteorData() {	
		if (this.state.userObj)
			return { 
				 slackusers : SlackUsers.find({_id: this.state.userObj.id}, {sort :{"profile.real_name" : 1}}).fetch(),
				 slacktriggers : SlackUserTriggers.find({userID : this.state.userObj.id}).fetch() }
		else
			return [];

	},

	//Need to get all the information for the users	

	clickAddTrigger(event){
		var triggerObj = {
			_id : new Meteor.Collection.ObjectID(),
			userID : this.state.userObj.id,
			triggerText : "Enter individual words,separated by spaces",
			responses : ["You can have multiple responses for this one trigger"]
		};

		SlackUserTriggers.insert(triggerObj);

		console.log("Tried to insert stuff");

	},

	clickDelTrigger(){
		//This needs to send data to the other component... do I create a new one here?
		console.log("Trigger Del Button Pressed");
		this.state.userObj.profile.real_name = "Clicked here";
		//Dispatcher.dispatch({type: "USER_INFO_SELECTED", data : this.props.data});
	},	

	dataChanged(data, objID) {        
		Meteor.call('updateTriggerText', this.state.userObj._id, 
			objID, data.description,
			function(err, response){
									     	//console.log(response);
									     });



	},

	customValidateText(text) {
        //return (text.length > 8 && text.length < 64);
    },	


    render() {

    	var triggers = ["There are no triggers here."];  	
    	
    	if (this.data.slacktriggers && this.data.slacktriggers.length > 0)
    	{
			//Clear the array of triggers			triggers = [];

				
				this.data.slacktriggers.forEach(function(obj) {				
				triggers.push(
					<div>
					<ScottTextEdit
					validate={this.customValidateText}
					activeClassName="editing"
					text={obj.triggerText}
					paramName="description"
					change={this.dataChanged}
					objID={obj._id._str}
					key={obj._id}						
					/>			
					</div>);
			}.bind(this));			
			}

			return (
				<div className="list-group" key="level1">

				<div key="level1.1">
					<button type="button" className="button" 
						onClick={this.clickAddTrigger}>
						Add Trigger
					</button>			
				</div>

				<div key="level2">
					{triggers}
				</div>

				</div>
				);
		}	



	});	``