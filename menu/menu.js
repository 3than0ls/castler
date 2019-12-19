import React from 'react';
import ReactDOM from 'react-dom';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import './menu.css';

/*
    user types in name in input field, data is passed along to a client connect function, which sends the server data about the client name (and other info)
    the server will then update/create UserState username property, which will then be sent to all clients to be seen

*/
class NameForm extends React.Component {
    constructor(props) {
        super(props);
        let nicknameAlreadyExists = window.localStorage.getItem('nickname');
        this.state = {
            value: nicknameAlreadyExists ? nicknameAlreadyExists : '',
        };
        this.maxChars = 10;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    handleChange(event) {
        let value = event.target.value.slice(0, this.maxChars);
        this.setState({value: value});
    }
    
    handleSubmit(event) {
        // if no value exists, then replace it with Player
        if (!this.state.value) {
            this.setState({value: 'Player'});
        }
        // store player name in local storage
        window.localStorage.setItem('nickname', this.state.value);
        // replace the entire menu node with the game iFrame
        let node = document.getElementById('menu');
        let iFrame = document.createElement('iframe');
        iFrame.src = '/game';
        iFrame.style.width = window.innerWidth + 'px';
        iFrame.style.height = window.innerHeight + 'px';
        node.parentNode.replaceChild(iFrame, node);
        // event prevent default
        event.preventDefault();
    }
    
    render() {
        return (
            /* 
            <form onSubmit={this.handleSubmit} id="nameForm">
                <input type="text" value={this.state.value} onChange={this.handleChange} placeholder="Name"/>
                <br></br>
                <input type="submit" value="Submit" />
            </form>
            */
            <Form className='overlayBoxContainer' onSubmit={this.handleSubmit} autoComplete="off" spellCheck="false">
            <Form.Group controlId="nicknameForm" className="noselect">
              <Form.Control value={this.state.value} placeholder="Enter nickname" onChange={this.handleChange}/>
            </Form.Group>
            
            <Button variant="primary" type="submit" className="noselect">
              Play
            </Button>
          </Form>
        );
    }
}

ReactDOM.render(<NameForm />, document.getElementById('menu'));