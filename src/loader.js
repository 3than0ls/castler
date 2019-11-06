const path = require('path');

import { setup } from "./game.js";

// import images
import blueCastle from "./assets/blueCastle.png"; // test image- may remove later
import playerBody from "./assets/playerBody.png";
import axeHand from "./assets/axeHand.png";

console.log('loading...');

export const assets = path.relative(__dirname, '/public/assets/');
console.log(assets);

export const loader = PIXI.Loader.shared;
loader
    .add('blueCastle', blueCastle)
    .add('axeHand', axeHand)
    .add('playerBody', playerBody)
    .load(setup);