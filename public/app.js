import React from 'react';
import ReactDOM from 'react-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

import { StartMenu } from './menu/menu.js';
ReactDOM.render(<StartMenu />, document.getElementById('menuWrapper'));

export let socket = undefined;


import { charm } from './vendors/charm/charm.js';
import { dust } from './vendors/dust/dust.js';

import { Player } from "./gameClasses/player.js";
import { resize } from "./utils/windowResize.js";

// import and render react overlay
import { App } from "./UI/index.js";

import { ClientStates } from './gameClasses/index.js';


/*/ create client state
export const clientState = {
    enemies: {},
    resources: {},
    entities: {},
    areas: {},
    structures: {},
    crates: {},

    timeTick: 0,
}*/

// Create renderer
export let renderer = undefined;
// Create Stage
export let stage = undefined

// create player
export let player = undefined;
// create client state
export let clientState = undefined;

import { socketUpdate, clientInit } from './sockets/index.js'; // imports socket update, but also calls playerInit in this file


function animate() {
    charm.update();
    dust.update();

    player.update();
    clientState.cycleNight(stage);
    
    requestAnimationFrame(() => {
        renderer.render(stage);
    });
}

export function setup() {
    socket = io();
    socket.on('connected', ()=> {
        // handle renderer and stage PIXI settings
        renderer = PIXI.autoDetectRenderer();
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.autoDensity = true;
        renderer.backgroundColor = 0x3d7d00;
        renderer.antialias = true;
        renderer.resize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.view); // add renderer to html document

        stage = new PIXI.Container();
        stage.sortableChildren = true;
        renderer.render(stage); // add stage to renderer
    
        // create player and clientState and initiate sockets
        player = new Player(socket.id);
        player.clientID = socket.id;
        player.render();
        clientState = new ClientStates(player, stage);

        clientInit(socket); 
        socketUpdate(socket);
    
        // render UI
        ReactDOM.render(<App />, document.getElementById('ui'));
    
        // resize renderer and game when needed
        resize();
        window.onresize = resize;
        
        clientState.worker.addEventListener('message', function(e) {
            animate();
            // issue: animate function calls are clumped, and are not even, so the socket emits data a lot of times for 1 moment and then stops for a period of time
        });

        // set off worker
        clientState.worker.postMessage('tick');
    })
}