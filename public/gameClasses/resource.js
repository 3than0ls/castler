import { socket, player, stage, renderer } from "../game";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";
import { ratio, gameWidth } from "../utils/windowResize";
import { charm } from "../charm/charm.js";
import { resourceEmit } from "../sockets/resoureEmit";

export class Resource {
    constructor(resourceID, type, amount, globalX, globalY) {
        this.type = type;
        this.resourceID = resourceID;
        this.amount = amount; // resources contain a certain amount you can harvest from, maybe change variable name
        
        this.alreadyHit = false;

        this.globalX = globalX;
        this.globalY = globalY;
    }

    render() {
        this.resourceGraphic = new PIXI.Sprite(loader.resources[this.type].texture);
        this.resourceGraphic.circular = true; // bump js settings
        
        // set positions
        this.resourceGraphic.anchor.x = 0.5; 
        this.resourceGraphic.anchor.y = 0.5;
        this.resourceGraphic.position.set(this.globalX, this.globalY);

        let resourceGraphic = this.resourceGraphic;
        player.viewpoint.addChild(resourceGraphic); // hands drawn below body
    }

    collide(playerGraphic) {
        return bump.circleResourceCollision(this.resourceGraphic, playerGraphic, true, true);
    }

    handSpriteCollision(collisionPoint) {
        return bump.hitTestPoint(collisionPoint, this.resourceGraphic);
    }

    hit(vx=10, vy=10, harvestSpeed) {
        let waypoints = [
            [this.globalX, this.globalY],
            [this.globalX+vx, this.globalY+vy],
            [this.globalX, this.globalY]
        ]
        charm.walkPath(this.resourceGraphic, waypoints, harvestSpeed*8, "smoothstep");
    }

    harvest(multiplier) {
        this.amount += 1*Math.round(multiplier);
    }
    
    animate(globalX, globalY, amount, playerHit) {
        // update positioning
        this.globalX = globalX;
        this.globalY = globalY;
        this.resourceGraphic.position.set(this.globalX, this.globalY);
        // update amount
        this.amount = amount;

        // add graphics to stage
        let resourceGraphic = this.resourceGraphic;       
        player.viewpoint.addChild(resourceGraphic); // hands drawn below body
    }
}