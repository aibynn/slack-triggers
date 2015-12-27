
UserList = React.createClass({
	displayName: 'Slack User List',

	mixins : [ReactMeteorData],

	getInitialState () {
		return {data: []};
	},

	componentDidMount() {				
		//This was put onto the server
	},

	getMeteorData() {		

		return { slackusers : SlackUsers.find({}, {sort :{"profile.real_name" : 1}}).fetch()  }
	},

	//Need to get all the information for the users

	render() {
		//This blows up if stuff is undefined... interesting.
		//console.log(this.data.slackusers[0].Scott);
		return (
			<div key="rootUserList">
			<SlackUserBox data={this.data.slackusers}/>
			</div>				
			);
	}	
});


//Box containing the user list
SlackUserBox = React.createClass({

	getInitialState () {
		return {data: []};
	},

	render() {
		return ( <div key="blahblahblah"> 
			<SlackUserList data={this.props.data} />
			</div> );
	}
})

//The list of users
SlackUserList = React.createClass({
	
	render() {
		//console.log(this.props.data);
		var items = this.props.data.map(function(user){
			return (
				<div key={user.id}>
					<SlackUserItem data={user}/>
				</div>
				)
		});

		return (		
			<div className="container-fluid" key="Yakomugi">

				{items}

			</div>
			)

	},
	

});

//Each individual user item
SlackUserItem = React.createClass({
	clickButton(){
		//This needs to send data to the other component... do I create a new one here?
		//console.log(this.props.data.id);
		Dispatcher.dispatch({type: "USER_INFO_SELECTED", data : this.props.data});
	},

    removeUser() {
        console.log("user obj is hopefully", this.props.data);

        Meteor.call('removeUser', this.props.data._id,
            function(err, response){
                //console.log(response);
            });
    },

	render ()
	{
		return (
			<div className="row">
				<button type="button" className="btn btn-default col-xs-10" onClick={this.clickButton}>
				    {this.props.data.profile.real_name} - {this.props.data.id}
				</button>
                <button className="btn btn-default bs col-xs-2" onClick={this.removeUser}><span className="glyphicon glyphicon-remove" aria-hidden="true"/></button>
            </div>
			)
	}
});

