const path = require('path');

import { setup } from "./game.js";

import blueCastle from "./assets/blueCastle.png"; // import image

console.log('loading...');

export const assets = path.relative(__dirname, '/public/assets/');
console.log(assets);

export const loader = PIXI.Loader.shared;
loader
    .add('blueCastle', blueCastle)
    .load(setup)