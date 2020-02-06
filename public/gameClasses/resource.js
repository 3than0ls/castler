import { player, particleContainer } from "../app";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";
import { ratio, gameWidth } from "../utils/windowResize";
import { charm } from "../charm/charm.js";
import { dust } from "../dust/dust.js";

export class Resource {
    constructor(resourceID, type, globalX, globalY) {
        this.type = type;
        switch(type) {
            case 'tree':
                this.resourceName = 'wood';
                break;
            case 'rock':
                this.resourceName = 'stone';
                break;
            default:
                this.resourceName = 'stone'
                break;
        }
        this.resourceID = resourceID;
        
        this.alreadyHit = false;
        this.tween = 0; // determines whether or not to update based on server sent variables or to 

        this.globalX = globalX;
        this.globalY = globalY;
    }

    render() {
        this.resourceGraphic = new PIXI.Sprite(loader.resources['resources/'.concat(this.type)].texture);
        this.resourceGraphic.circular = true; // bump js settings
        
        // set positions
        this.resourceGraphic.anchor.x = 0.5; 
        this.resourceGraphic.anchor.y = 0.5;
        this.resourceGraphic.position.set(this.globalX, this.globalY);

        // set zIndex (the parent container, player.viewpoint, enables sortable children)
        this.resourceGraphic.zIndex = 25;

        let resourceGraphic = this.resourceGraphic;
        player.viewpoint.addChild(resourceGraphic);
    }

    collide(graphic) {
        return bump.circleGameCollision(this.resourceGraphic, graphic, false, true);
    }

    handSpriteCollision(collisionPoint) {
        return bump.hitTestPoint(collisionPoint, this.resourceGraphic);
    }

    hit(vx, vy, collisionX, collisionY, harvestSpeed) {
        // create an effect where the resource appears to have bumped when hit
        let waypoints = [
            [this.globalX, this.globalY],
            [this.globalX+vx, this.globalY+vy],
            [this.globalX, this.globalY]
        ]
        this.tweenTick++; // start tween tick so server update doesn't affect charm animation
        charm.walkPath(this.resourceGraphic, waypoints, harvestSpeed * 10, "smoothstep");

        if (this.tweenTick > harvestSpeed * 10 * (waypoints.length-1)) {
            this.tweenTick = 0;
        }

        // emit particle when hit
        dust.create(
            collisionX,
            collisionY,
            () => new PIXI.Sprite(loader.resources['particles/'.concat((this.resourceName ? this.resourceName : 'stone').concat('Particle'))].texture),
            player.viewpoint,
            25,
            0,
            true,
            0, 6.28,
            12, 24,
            1.5, 2,
            0.005, 0.01,
            0.005, 0.01, // sometimes for a split second, it renders over the resource sprite, fix?
        );
    }
    
    animate(globalX, globalY) {
        if (!this.tweenTick === 0) {
            // update positioning
            this.globalX = globalX;
            this.globalY = globalY;
            this.resourceGraphic.position.set(this.globalX, this.globalY);
        } else if (this.tweenTick > 0) {
            this.tweenTick++;
        }

        // add graphics to stage
        let resourceGraphic = this.resourceGraphic;       
        player.viewpoint.addChild(resourceGraphic); // hands drawn below body
    }

    delete() { // delete user when disconnected
        player.viewpoint.removeChild(this.resourceGraphic);
    }
}