import React from 'react';
import ReactDOM from 'react-dom';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import './menu.css';
import { player } from '../../app';

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
        location.reload();
        event.preventDefault();
    }
    
    render() {
        return (
            <Form className='overlayBoxContainer' onSubmit={this.handleSubmit} autoComplete="off" spellCheck="false">
                {this.state.nickname} died!
                <br></br>
                Score: {this.props.score}
            
            <Button variant="primary" type="submit" className="noselect">
              Play Again
            </Button>
          </Form>
        );
    }
}
export function renderDeathMenu() {
    // add death menu wrapper node
    let deathMenuWrapper = document.createElement('div');
    document.body.appendChild(deathMenuWrapper);
    deathMenuWrapper.id = 'deathMenuWrapper';
    ReactDOM.render(<DeathMenu score={player.score} />, document.getElementById('deathMenuWrapper'));
}

// also have to remove all event detectors, probably freeze the game/no longer update it