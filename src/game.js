import { Player } from "./gameClasses/player.js";

export const socket = io();
/*
    find way to make it so:
    1) load images
    2) connect socket
    3) update
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

const player = new Player(socket.io.engine.id);

export function setup() {
    console.log('finished loading');

    player.render();

    animate();
}

socket.on('connect', () => {
    console.log('connected');
});

function animate() {
    player.update();

    console.log('animating');
    renderer.render(stage);
}

