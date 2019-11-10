import { renderer, stage, player } from "../game.js";

// script to resize window when changed

const gameWidth = 1920;
const gameHeight = 970;

export var ratio = Math.max(window.innerWidth/gameWidth, window.innerHeight/gameHeight);
export function resize() {
    ratio = Math.max(window.innerWidth/gameWidth, window.innerHeight/gameHeight);
	renderer.resize(window.innerWidth, window.innerHeight);
  
    stage.scale.x = stage.scale.y = ratio;
    
    player.resizeAdjust((window.innerWidth/2)/ratio, (window.innerHeight/2)/ratio);
    /*
    viewpoint.resizeAdjust(((window.innerWidth/2))/ratio+player.globalX, ((window.innerHeight/2))/ratio+player.globalY);*/
    // work on readjusting players to fit this
}