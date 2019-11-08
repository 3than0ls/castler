import { stage, player } from "./../game.js";
import { loader } from "./../loader.js";

export class Enemy {
    constructor(clientID, globalX, globalY) {
        // basically is the same as player class, but without any required user input parts
        this.globalX = globalX;
        this.globalY = globalY;
        this.clientID = clientID;

        this.vx = 0;
        this.vy = 0; // maybe used later?
    }

    render() { // basically what happens for players
        // render body graphic
        this.bodyGraphic = new PIXI.Sprite(loader.resources['playerBody'].texture);
        // set positions
        this.bodyGraphic.anchor.x = 0.5;
        this.bodyGraphic.anchor.y = 0.5;
        this.bodyGraphic.position.set(this.globalX, this.globalY);

        // render hands
        this.axeHandGraphic = new PIXI.Sprite(loader.resources['axeHand'].texture);
        // set positions
        this.axeHandGraphic.anchor.x = 0.4; // anchor positions have been pre calculated
        this.axeHandGraphic.anchor.y = 0.55;
        this.axeHandGraphic.position.set(this.globalX, this.globalY);

        // give it a high zIndex to render it over other objects
        this.bodyGraphic.zIndex = 50;
        this.axeHandGraphic.zIndex = 49;

        // finally, render each to the viewpoint of player, different from rendering to stage
        let axeHandGraphic = this.axeHandGraphic;
        let bodyGraphic = this.bodyGraphic;
        player.viewpoint.addChild(axeHandGraphic, bodyGraphic); // hands drawn below body
    }

    animate(globalX, globalY, angle) {
        // the animate function is different from the update in player class
        // animate takes input supplied from the server and applies it to the enemies
        // update positioning
        this.globalX = globalX;
        this.globalY = globalY;
        // update angle 
        this.angle = angle;

        // update rendered position
        console.log(globalX);
        console.log(angle);
        this.axeHandGraphic.position.set(globalX, globalY);
        this.bodyGraphic.position.set(globalX, globalY);
        // update rendered angle
        this.axeHandGraphic.rotation = angle;
        this.bodyGraphic.rotation = angle;

        // add graphics to stage
        let bodyGraphic = this.bodyGraphic;
        let axeHandGraphic = this.axeHandGraphic;
        player.viewpoint.addChild(axeHandGraphic, bodyGraphic);
    }

    delete() { // delete user when disconnected
        let bodyGraphic = this.bodyGraphic 
        let axeHandGraphic = this.axeHandGraphic;
        player.viewpoint.removeChild(bodyGraphic, axeHandGraphic);
        // add more
    }
}