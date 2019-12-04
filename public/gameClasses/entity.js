import { player } from "../game";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";
import { charm } from "../charm/charm";
import { dust } from "../dust/dust";

export class Entity {
    constructor(entityID, type, nuetrality, globalX, globalY) {
        this.type = type;
        this.nuetrality = nuetrality;
        this.entityID = entityID;

        this.alreadyHit = false;

        this.globalX = globalX;
        this.globalY = globalY;
    }

    render() {
        this.entityGraphic = new PIXI.Sprite(loader.resources[this.type].texture);
        this.entityGraphic.circular = true; // bump js settings
        this.entityGraphic.radius = (this.entityGraphic.width * 0.798)/2; // 0.798 is only for duck
        
        // set positions
        this.entityGraphic.anchor.x = 0.5; 
        this.entityGraphic.anchor.y = 0.5;
        this.entityGraphic.position.set(this.globalX, this.globalY);

        let entityGraphic = this.entityGraphic;
        player.viewpoint.addChild(entityGraphic); // hands drawn below body
    }

    collide(playerGraphic) {
        return bump.circleGameCollision(this.entityGraphic, playerGraphic, true, true);
    }

    handSpriteCollision(collisionPoint) {
        return bump.hitTestPoint(collisionPoint, this.entityGraphic);
    }

    hit(vx, vy, collisionX, collisionY, attackSpeed) {
        charm.slide(this.entityGraphic, this.globalX+vx, this.globalY+vy, 40, "deceleration");
        // emit particle when hit
        dust.create(
            collisionX,
            collisionY,
            () => new PIXI.Sprite(loader.resources['woodParticle'].texture),
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
    
    animate(globalX, globalY, angle, nuetrality) {
        // update positioning
        this.globalX = globalX;
        this.globalY = globalY;
        this.entityGraphic.position.set(this.globalX, this.globalY);

        this.angle = angle;
        this.entityGraphic.angle = this.angle;
        
        // add graphics to stage
        let entityGraphic = this.entityGraphic;       
        player.viewpoint.addChild(entityGraphic); // hands drawn below body
    }
}