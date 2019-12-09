const path = require('path');

import { setup } from "../game.js";


// import images
import playerBody from "./../assets/playerBody.png";
import axeHand from "./../assets/axeHand.png";
import swordHand from "./../assets/swordHand.png";
import hand from "./../assets/hand.png"; // maybe later use some sort of string concatenation or path joining
import rock from "./../assets/rock.png";
import tree from "./../assets/tree.png";
import woodParticle from "./../assets/woodParticle.png";
import stoneParticle from "./../assets/stoneParticle.png";
import duck from './../assets/duck.png';
import boar from './../assets/boar.png';
import bloodParticle from './../assets/bloodParticle.png';
import feather from './../assets/feather.png';
import fur from './../assets/fur.png';

console.log('loading...');

export const assets = path.relative(__dirname, '/public/assets/'); // remove

export const loader = PIXI.Loader.shared;
loader
    .add('axeHand', axeHand)
    .add('swordHand', swordHand)
    .add('hand', hand)
    .add('playerBody', playerBody)
    .add('rock', rock)
    .add('tree', tree)
    .add('stoneParticle', stoneParticle)
    .add('woodParticle', woodParticle)
    .add('duck', duck)
    .add('boar', boar)
    .add('bloodParticle', bloodParticle)
    .add('feather', feather)
    .add('fur', fur)
    .load(setup);