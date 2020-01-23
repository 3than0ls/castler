import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export const socket = io();

import { charm } from './charm/charm.js';
import { dust } from './dust/dust.js';
import { Player } from "./gameClasses/player.js";
import { resize } from "./utils/windowResize.js";

// create client state
export const clientState = {
    enemies: {},
    resources: {},
    entities: {},
    areas: {},
    structures: {},
}

/*
    TO DO:
    clean up code
    ISSUES: 
    player does not attack flash if their client window is not focused


    (entity-player bump collision issue)
    in bump, when the player unfocuses tab, entities can enter inside the player, which increases the overlap and causes the player to move very far distances
    more info:
        because the worker updates the page and emits client data in bursts, normally when the page is focused, it'll emit an example of 1 client state emit every 
    1 second. however, if the page is hidden, it will emit 10 client states every exactly ten seconds. to solve this, just remove collisions calculations from the worker "burst"

    (entity-area border issue)
    entities for some reason in areas go to edge and then get stuck there when they try to go back
    BIG:
    armor


    pvp

    player placable buildings

    specified crafting areas (furnace, workbench, anvil)

    SMALL:
    more different resources 
    add item image for iron
    add more tiered tool (iron)
*/

document.title = "Game";

// Create renderer
export const renderer = PIXI.autoDetectRenderer();
// handle renderer settings
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoDensity = true;
renderer.backgroundColor = 0x3d7d00;
renderer.antialias = true;
renderer.resize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.view); // add renderer to html document

// Create Stage
export const stage = new PIXI.Container();
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

    boundary.updateBoundary();
    player.update();
}

export function animate() {
    update();
    requestAnimationFrame(() => {
        renderer.render(stage);
    });
}

// Web Worker to updated our game
/*
// if using worker-loader module
import Worker from "worker-loader!./webWorker/worker.js"; 
const worker = new Worker();*/
// if using worker-plugin

export const worker = new Worker('./worker/worker.js', { type: 'module' });
worker.addEventListener('message', function(e) {
    animate();
    // issue: animate function calls are clumped, and are not even, so the socket emits data a lot of times for 1 moment and then stops for a period of time
});


// import and render react overlay
import { App } from "./UI/index.js";
ReactDOM.render(<App />, document.getElementById('ui'));

export function setup() {
    socketUpdate(socket);
    
    player.clientID = socket.id;
    
    player.render();

    // resize renderer and game when needed
    resize();
    window.onresize = resize;
    
    // set off worker
    worker.postMessage('tick');
}


