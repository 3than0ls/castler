import React from 'react';
import ReactDOM from 'react-dom';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import './menu.css';
import { loader, loadImages } from '../utils/loader';
import { setup } from '../app';

/*
    user types in name in input field, data is passed along to a client connect function, which sends the server data about the client name (and other info)
    the server will then update/create UserState username property, which will then be sent to all clients to be seen
*/

function post(path, params, method='post') {
    const form = document.createElement('form');
    form.method = method;
    form.action = path;
  
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = params[key];
  
        form.appendChild(hiddenField);
      }
    }
  
    document.body.appendChild(form);
    form.submit();
}

export let play = false;

export class StartMenu extends React.Component {
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
        // prevent page from refreshing
        event.preventDefault();
        // if no value exists, then replace it with Player
        if (!this.state.value) {
            this.setState({value: 'Player'});
        }
        // store player name in local storage
        window.localStorage.setItem('nickname', this.state.value);
        play = true;

        // delete the entire start menu body
        let body = document.getElementsByTagName('BODY')[0];
        let menuWrapper = document.getElementById('menuWrapper');
        body.removeChild(menuWrapper);

        let ui = document.createElement("div");
        ui.id = "ui";
        body.appendChild(ui);

        loadImages();
        loader.load(setup)
        /*
        let appScript = document.getElementById('gameApp');

        // post('/', {nickname: this.state.value}); look into ajax

        appScript.src = 'app.bundle.js';*/
    }
    
    render() {
        return (
            <Form className='menuBoxContainer' onSubmit={this.handleSubmit} autoComplete="off" spellCheck="false">
                <Form.Group controlId="nicknameForm" className="noselect">
                <Form.Control value={this.state.value} placeholder="Enter nickname" onChange={this.handleChange}/>
                </Form.Group>
                
                <Button variant="play" type="submit">
                Play
                </Button>
          </Form>
        );
    }
}
