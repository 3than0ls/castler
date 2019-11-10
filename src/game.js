import { Player } from "./gameClasses/player.js";
import { userUpdate } from "./sockets/update/userUpdate.js";
import { resourceUpdate } from "./sockets/update/resourceUpdate.js";


export const socket = io();

// create client state
export const clientState = {
    enemies: {},
    resources: {},
}

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
import { resize } from "./utils/windowResize.js";
const worker = new Worker();
// post ticks and listen for messages received to updated
worker.postMessage('tick');
worker.addEventListener('message', function(e) {
    requestAnimationFrame(animate);
});

// create player
export const player = new Player(socket.io.engine.id);


export function setup() {
    console.log('finished loading');
    userUpdate(socket, clientState);
    resourceUpdate(socket, clientState);
    
    player.render();

    // resize renderer and game when needed
    resize();
    window.onresize = resize;

    animate();
}

socket.on('connect', () => {
    console.log('connected');
});

function animate() {
    player.update();

    
    renderer.render(stage);
}

