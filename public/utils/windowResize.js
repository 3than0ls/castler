import { renderer, player, clientState, globalContainer, stage } from "../app.js";

// default widthsm heights to 1920, 970


export const gameWidth = 1920;
export const gameHeight = 970;

export var ratio = Math.max(window.innerWidth/gameWidth, window.innerHeight/gameHeight);
export function resize() {
    ratio = Math.max(window.innerWidth/gameWidth, window.innerHeight/gameHeight);
    renderer.resize(window.innerWidth, window.innerHeight);
    
    globalContainer.scale.x = globalContainer.scale.y = ratio;
    
    player.resizeAdjust((window.innerWidth/2)/ratio, (window.innerHeight/2)/ratio);
    clientState.resize();
    /*
    viewpoint.resizeAdjust(((window.innerWidth/2))/ratio+player.globalX, ((window.innerHeight/2))/ratio+player.globalY);*/
    // work on readjusting players to fit this
}