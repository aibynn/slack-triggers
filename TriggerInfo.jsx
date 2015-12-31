TriggerInfo = React.createClass({
    displayName: 'Slack Trigger Info',

    mixins : [ReactMeteorData],

    getInitialState () {
        return ({
            text: '',
            editing: false,
            selected : false
        });
    },

    componentDidMount() {
        //This gets called via flux, when an object is clicked on
        Dispatcher.register(function(payload){
            switch(payload.type){
                case 'USER_INFO_SELECTED':
                    this.setState({userObj : payload.data});
                    break;
            }

        }.bind(this));
        //http://stackoverflow.com/questions/31045716/react-this-setstate-is-not-a-function

    },

    getMeteorData() {
        //console.log("TriggerInfo.getMeteorData");
        if (this.state.userObj)
        {
            //console.log("this.state.userObj is valid");
            return  {
                slackusers : SlackUsers.find({_id: this.state.userObj.id}, {sort :{"profile.real_name" : 1}}).fetch(),
                slacktriggers : SlackUserTriggers.find({userID : this.state.userObj.id}).fetch(),
                str : SlackTriggerResponses
            }

        }
        else
            return [];

    },

    //Need to get all the information for the users

    clickAddTrigger(event){
        var triggerObj = {
            _id : new Meteor.Collection.ObjectID(),
            userID : this.state.userObj.id,
            triggerText : "Enter individual words,separated by spaces"
        };

        SlackUserTriggers.insert(triggerObj);
    },

    clickDelTrigger(){
        //This needs to send data to the other component... do I create a new one here?
        console.log("Trigger Del Button Pressed");
        this.state.userObj.profile.real_name = "Clicked here";
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

    onstartedit(triggerID)
    {
        //How to choose which item by the trigger ID?
        Dispatcher.dispatch({type: "TRIGGER_SELECTED", data : {"triggerID": triggerID}});

        //Can I modify all of the ones in the list?
        this.setState({'selected' : triggerID});
        console.log("state selected =", this.state.selected);

    },

    clickTestHighlight(){
        //Can I set the classname of an object?


    },
    removeTrigger(ID)
    {
        Meteor.call('removeTrigger', ID,
            function (err, response) {
                //console.log(response);
            });
    },
    render() {

        var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

        var triggers = <div>No triggers here yet</div>;

        if (this.data.slacktriggers && this.data.slacktriggers.length > 0)
        {
            // 	//Clear the array of triggers
            triggers = [];

            this.data.slacktriggers.forEach(function(obj) {
                var inClass = classNames({
                    'form-control' : true,
                    'selected-item' : this.state.selected == obj._id._str
                });

                triggers.push(
                    <div key={obj._id._str + "-aaa"} className="input-group col-xs-12">
                        <ScottTextEdit
                            validate={this.customValidateText}
                            activeClassName="form-control"
                            className={inClass}
                            element="input"
                            text={obj.triggerText}
                            paramName="description"
                            change={this.dataChanged}
                            onstartedit={this.onstartedit}
                            objID={obj._id._str}
                            key={obj._id._str}
                        ></ScottTextEdit>
                        <span className="input-group-addon">{this.data.str.find({"triggerID" : obj._id._str}).count()}</span>
                        <button className="btn btn-default bs col-xs-12" onClick={this.removeTrigger.bind(this, obj._id._str )}> <span className="glyphicon glyphicon-remove" aria-hidden="true"/></button>
                    </div>
                );

            }.bind(this));
        }

//
        return (
            <div>
                <div className="list-group" key="kersplatch">
                    <button type="button" className="btn btn-primary btn-block"
                            onClick={this.clickAddTrigger} key="add-trigger-button">
                        Add Trigger
                    </button>
                </div>

                <div>
                    <ReactCSSTransitionGroup transitionName="example" component="div"
                                             transitionAppearTimeout={05}
                                             transitionEnterTimeout={500}
                                             transitionLeaveTimeout={5}
                                             transitionAppear={false}
                                             transitionLeave={false}
                                             exclusive={true} >
                        {triggers}
                    </ReactCSSTransitionGroup>
                </div>
            </div>

        );
    }
});	
