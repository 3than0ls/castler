import React from 'react';
import ReactDOM from 'react-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

export const socket = io();


import { charm } from './charm/charm.js';
import { dust } from './dust/dust.js';
import { Player } from "./gameClasses/player.js";
import { resize } from "./utils/windowResize.js";

import { StartMenu } from './menu/menu.js';

ReactDOM.render(<StartMenu />, document.getElementById('menuWrapper'));

// create client state
export const clientState = {
    enemies: {},
    resources: {},
    entities: {},
    areas: {},
    structures: {},
    crates: {},

    timeTick: 0,
}

export const leaderboardState = [];

export const craftableItemsState = [];

document.title = "Game";

// Create renderer
export const renderer = PIXI.autoDetectRenderer();

// Create Stage
export const stage = new PIXI.Container();
stage.sortableChildren = true;
renderer.render(stage); // add stage to renderer


// create player
export const player = new Player(socket.io.engine.id);

// create boundary variable that will be assigned later once client init data is received
import { Boundary } from './gameClasses/boundary.js';
export const boundary = new Boundary();

import { socketUpdate, clientInit } from './sockets/index.js'; // imports socket update, but also calls playerInit in this file
clientInit(socket); 

export function update() {
    charm.update();
    dust.update();

    player.update();
}

export function animate() {
    update();
    requestAnimationFrame(() => {
        renderer.render(stage);
    });
}

// Web Worker to updated our game

export const worker = new Worker('./worker/worker.js', { type: 'module' });


// import and render react overlay
import { App } from "./UI/index.js";

export function setup() {
    // handle renderer settings
    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoDensity = true;
    renderer.backgroundColor = 0x3d7d00;
    renderer.antialias = true;
    renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.view); // add renderer to html document

    ReactDOM.render(<App />, document.getElementById('ui'));

    
    worker.addEventListener('message', function(e) {
        animate();
        // issue: animate function calls are clumped, and are not even, so the socket emits data a lot of times for 1 moment and then stops for a period of time
    });

    socketUpdate(socket);
    
    player.clientID = socket.id;
    
    player.render();

    // resize renderer and game when needed
    resize();
    window.onresize = resize;
    
    // set off worker
    worker.postMessage('tick');
}