import React from 'react';
import ReactDOM from 'react-dom';

import Button from 'react-bootstrap/Button';

import './menu.css';

/*
    user types in name in input field, data is passed along to a client connect function, which sends the server data about the client name (and other info)
    the server will then update/create UserState username property, which will then be sent to all clients to be seen

*/
class DeathMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nickname: window.localStorage.getItem('nickname'),
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    handleSubmit(event) {
        // event prevent default
        event.preventDefault();
    }
    
    render() {
        return (
            <Form className='overlayBoxContainer' onSubmit={this.handleSubmit} autoComplete="off" spellCheck="false">
                You Died!
            
            <Button variant="primary" type="submit" className="noselect">
              Play Again
            </Button>
          </Form>
        );
    }
}

ReactDOM.render(<DeathMenu />, document.getElementById('menu'));