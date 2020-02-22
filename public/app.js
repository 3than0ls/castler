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
    crates: {},

    timeTick: 0,
}

/*
    TO DO:
    ISSUES: 
    need to add scroll bar to crates

    BIG:
    create walking particle

    turn boundaries into a map/game client side class, where we can implement time cycles normally (read code cleanup description)

    SMALL:
    more different resources, areas, entities, weapons, 
    create sprites for armor


    CODE CLEANING:
        - transfer EVERY config (entity data, resource data, weapon stats, armor stats) to config files into gameConfigs, and eliminate all need for switch statements
        - create a server state class with appopriate functions whose main purpose is to contain the serverState and update it
        - create a client state class with appropriate functions, which include containing the clientState, updating it, updating boundaries, running day/night cycles, and other types of things that don't seem to have a place
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


