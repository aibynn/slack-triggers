ResponseInfo = React.createClass({
    displayName: 'Trigger Response Info',

    mixins: [ReactMeteorData],

    getInitialState () {
        return ({
            text: '',
            editing: false

        });
    },

    componentDidMount() {
        //This gets called via flux, when an object is clicked on
        Dispatcher.register(function(payload){

            switch(payload.type){
                case 'TRIGGER_SELECTED':
                    this.setState({triggerInfo : payload.data});
                    break;
                case 'USER_INFO_SELECTED':
                    this.setState({triggerInfo : {}});
                    break;
            }

        }.bind(this));
        //http://stackoverflow.com/questions/31045716/react-this-setstate-is-not-a-function
    },

    clickAddResponse(event){
        var responseObj = {
            _id : new Meteor.Collection.ObjectID(),
            triggerID : this.state.triggerInfo.triggerID,
            responseText : "Placeholder Response"
        };

        SlackTriggerResponses.insert(responseObj);
    },

    getMeteorData() {
        if (this.state.triggerInfo)
            return {
                slacktriggerresponses : SlackTriggerResponses.find({triggerID : this.state.triggerInfo.triggerID}).fetch()
            }
        else
        {
            return [];
        }

    },

    dataChanged(data, objID) {
        //console.log(data);
        //console.log(objID);

        Meteor.call('updateResponseText', objID, data.description,
            function(err, response){
                //console.log(response);
            });

    },

    customValidateText(text) {
        //return (text.length > 8 && text.length < 64);
    },
    removeResponse(ID)
    {
        Meteor.call('removeResponse', ID,
            function (err, response) {
                //console.log(response);
            });
    },


    render() {

        var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

        var responses = <div>No responses here yet</div>;

        if (this.data.slacktriggerresponses && this.data.slacktriggerresponses.length > 0)
        {
            responses = [];
            this.data.slacktriggerresponses.forEach(function(obj) {
                responses.push(
                        <div key={obj._id._str + "-bbb"} className="input-group col-xs-12">
                            <ScottTextEdit
                                validate={this.customValidateText}
                                activeClassName="form-control"
                                className="form-control"
                                element="input"
                                text={obj.responseText}
                                paramName="description"
                                change={this.dataChanged}
                                objID={obj._id._str}
                                key={obj._id._str}
                            ></ScottTextEdit>

                        <span className="input-group-btn">
                            <button className="btn btn-default bs col-xs-12" onClick={this.removeResponse.bind(this, obj._id._str )}> <span className="glyphicon glyphicon-remove" aria-hidden="true"/></button>
                        </span>

                    </div>
                );
            }.bind(this));
        }

        return (
            <div>
                <div className="list-group" key="kersplatch-response">
                    <button type="button" className="btn btn-primary btn-block"
                            onClick={this.clickAddResponse}>
                        Add Response
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
                        {responses}
                    </ReactCSSTransitionGroup>
                </div>
            </div>
        );
    }
});