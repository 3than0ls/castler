import { Castle } from "./gameClasses/castle.js";

const socket = io();

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



function connected() {
    console.log('connected');
};
const castle = new Castle(socket.io.engine.id)

export function setup() {
    console.log('finished loading');
    castle.render();

    animate();
}

function animate() {
    castle.update();
    console.log('animating');
    renderer.render(stage);
}


socket.on('connect', connected);