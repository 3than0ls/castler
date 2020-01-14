import { stage, player } from "../app.js";
import { loader } from "./../utils/loader.js";
import { Player } from "./player.js";
import { charm } from "../charm/charm.js";


export class Enemy {
    constructor(clientID, globalX, globalY, toolTier) {
        // basically is the same as player class, but without any required user input parts
        // basically a puppet, which is controlled by server sent data
        this.globalX = globalX;
        this.globalY = globalY;
        this.clientID = clientID;

        this.displayHand = 'hand';
        this.handSpriteKey = this.displayHand === 'hand' ? 'hand' : this.toolTier.concat(this.displayHand);
        this.handSprites = {};
        this.toolTier = toolTier;
    }

    attackFlash() {
        if (this.bodyGraphic.tint === 0xFFFFFF) {
            let tint = charm.redTint(this.bodyGraphic);
            tint.onComplete = () => {
                // reset tint to nothing
                this.bodyGraphic.tint = 0xFFFFFF
            }
        }
    }

    render() { // basically what happens for players
        // render body graphic
        this.bodyGraphic = new PIXI.Sprite(loader.resources['player/playerBody'].texture);
        // set positions
        this.bodyGraphic.anchor.x = 0.5;
        this.bodyGraphic.anchor.y = 0.5;
        this.bodyGraphic.position.set(this.globalX, this.globalY);

        // render and create hand sprites
        Player.createHandSprites(this.handSprites, this.globalX, this.globalY, this.toolTier);

        // give it a high zIndex to render it over other objects
        this.bodyGraphic.zIndex = 50;
        this.handSprites[this.handSpriteKey].zIndex = 49;

        // finally, render each to the viewpoint of player, different from rendering to stage
        let handGraphic = this.handSprites[this.handSpriteKey];
        let bodyGraphic = this.bodyGraphic;
        player.viewpoint.addChild(handGraphic, bodyGraphic); // hands drawn below body
    }

    animate(globalX, globalY, angle, swingAngle, displayHand) {
        // the animate function is different from the update in player class
        // animate takes input supplied from the server and applies it to the enemies
        // update positioning
        this.globalX = globalX;
        this.globalY = globalY;
        // update angle 
        this.angle = angle;

        // remove current displayed hand (which may be different) and then update it
        player.viewpoint.removeChild(this.handSprites[this.handSpriteKey]);
        this.displayHand = displayHand;

        // determine hand sprite key
        this.handSpriteKey = this.displayHand === 'hand' ? 'hand' : this.toolTier.concat(this.displayHand);

        // update rendered position
        this.handSprites[this.handSpriteKey].position.set(globalX, globalY);  // <- remove the this in displayhand later
        this.bodyGraphic.position.set(globalX, globalY);
        // update rendered angle
        this.handSprites[this.handSpriteKey].rotation = angle;
        this.handSprites[this.handSpriteKey].angle += swingAngle // add on the swingAngle angle, in degrees
        this.bodyGraphic.rotation = angle;

        // add graphics to stage
        let handGraphic = this.handSprites[this.handSpriteKey];
        let bodyGraphic = this.bodyGraphic;                
        player.viewpoint.addChild(handGraphic, bodyGraphic); // hands drawn below body
    }

    delete() { // delete user when disconnected
        let bodyGraphic = this.bodyGraphic 
        let hand = this.handSprites[this.handSpriteKey];
        player.viewpoint.removeChild(bodyGraphic, hand);
        // add more sprite removals if needed
    }
}