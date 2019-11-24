import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { charm } from './charm/charm.js';
import { Player } from "./gameClasses/player.js";
import { userUpdate } from "./sockets/update/userUpdate.js";
import { resourceUpdate } from "./sockets/update/resourceUpdate.js";
import { inventoryUpdate } from './sockets/update/inventoryUpdate.js';

export const socket = io();

// create client state
export const clientState = {
    enemies: {},
    resources: {},
}

/*
    TO DO:
    clean up code
    BIG:
    Player GUI
    weapons (poke rather than swing) and animals (entity rather than resource)

    SMALL:
    particle (dust js) when resource is hit
    more different resources
*/

// Create renderer
export const renderer = PIXI.autoDetectRenderer();
// handle renderer settings
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoDensity = true;
renderer.backgroundColor = 0x0077AA;
renderer.antialias = true;
renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.view); // add renderer to html document

// Create Stage
export const stage = new PIXI.Container();

renderer.render(stage); // add stage to renderer


// Web Worker to updated our game
import Worker from "worker-loader!./webWorker/worker.js"; // import worker and use worker loader rule specified in webpack config
const worker = new Worker();
// post ticks and listen for messages received to updated
worker.postMessage('tick');
worker.addEventListener('message', function(e) {
    requestAnimationFrame(animate);
});

// create player
export const player = new Player(socket.io.engine.id);
console.log('player created');

// game window resize functions
import { resize } from "./utils/windowResize.js";
resize();

inventoryUpdate(socket);

// react overlay
import { Inventory } from "./UI/inventory.js"; // maybe move to a player method?

export function setup() {
    console.log('finished loading');
    userUpdate(socket, clientState);
    resourceUpdate(socket, clientState);
    
    player.render();
    ReactDOM.render(<Inventory />, document.getElementById('root'));

    // resize renderer and game when needed
    resize();
    window.onresize = resize;

    animate();
}

socket.on('connect', () => {
    console.log('connected');
});

function animate() {
    charm.update();

    player.update();

    renderer.render(stage);
}

