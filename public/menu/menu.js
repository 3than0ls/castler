import React from 'react';
import ReactDOM from 'react-dom';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import './menu.css';
import { loader, loadImages } from '../utils/loader';
import { setup } from '../app';


document.title = "Castler";

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
