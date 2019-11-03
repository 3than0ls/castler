import { setup } from "./game.js";

console.log('loading...');

export const loader = PIXI.loader;
loader
    .add("assets/blueCastle.png")
    .load(setup)