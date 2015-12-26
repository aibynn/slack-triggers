function SelectInputText(element) {
	element.setSelectionRange(0, element.value.length);
}

ScottTextEdit = React.createClass({
	displayName: 'Scott Text Edit',

	mixins : [ReactMeteorData],

	getMeteorData() {	
		return {};
	},


	propTypes : {
		text: React.PropTypes.string.isRequired,
		paramName: React.PropTypes.string.isRequired,
		change: React.PropTypes.func.isRequired,		
		onstartedit : React.PropTypes.func,
		placeholder: React.PropTypes.string,
		activeClassName: React.PropTypes.string,	    
		validate: React.PropTypes.func,
		element: React.PropTypes.string,
		objID: React.PropTypes.string
	},

	getInitialState () {		
		return ({
			editing:false,
			text: this.props.text,			
			objID: this.props.objID //Do I need this?
		})
	},

	startEditing(){
		this.setState({editing: true, text: this.props.text});		
		if (this.props.onstartedit)
			this.props.onstartedit(this.props.objID);
	},

	finishEditing() {
		//if(this.isInputValid(this.state.text) && this.props.text != this.state.text){
			this.commitEditing();
		//} else if (this.props.text === this.state.text || !this.isInputValid(this.state.text)) {
		//	this.cancelEditing();
		//}
	},

	cancelEditing() {
		this.setState({editing: false, text: this.props.text});
	},

	commitEditing() {
		this.setState({editing: false, text: this.state.text});
		let newProp = {};
		newProp[this.props.paramName] = this.state.text;
		this.props.change(newProp, this.props.objID );
	},

	keyDown(event) {
		if(event.keyCode === 13) {
			this.finishEditing();
		} else if (event.keyCode === 27) {
			this.cancelEditing();
		}
	},

	textChanged(event) {
		this.setState({
			text: event.target.value.trim()
		})
	},

	componentDidUpdate(prevProps, prevState) {
		var inputElem = ReactDOM.findDOMNode(this.refs.input);
		if (this.state.editing && !prevState.editing) {
			inputElem.focus();
			SelectInputText(inputElem);
		} else if (this.state.editing && prevProps.text != this.props.text) {
			this.finishEditing();
		}
	},

	render() {				

		if(!this.state.editing) {
			return <input className={this.props.className} onClick={this.startEditing} 
				defaultValue={this.state.text || this.props.placeholder} key={this.props.objID}/>
		} else {
			const Element = this.props.element || 'input';
			return 	<Element className={this.props.activeClassName} onKeyDown={this.keyDown} onBlur={this.finishEditing} 
					ref="input" placeholder={this.props.placeholder} defaultValue={this.state.text} onChange={this.textChanged} onReturn={this.finishEditing} />
		}		
	}
});

