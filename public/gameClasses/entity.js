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
        charm.slide(this.entityGraphic, this.globalX+vx, this.globalY+vy, attackSpeed*8, "deceleration");
        // emit particle when hit
        dust.create(
            collisionX,
            collisionY,
            () => new PIXI.Sprite(loader.resources['bloodParticle'].texture),
            player.viewpoint,
            25,
            0,
            true,
            0, 6.28,
            12, 24,
            1.5, 2,
            0.02, 0.04,
            0.02, 0.04,
        );
    }

    die(collisionX, collisionY) {
        // emit particle when died
        let deathParticle;
        switch (this.type) {
            case "duck":
                deathParticle = "feather";
                break;
            default:
                deathParticle = "bloodParticle";
                break;
        }
        dust.create(
            this.globalX,
            this.globalY,
            () => new PIXI.Sprite(loader.resources[deathParticle].texture),
            player.viewpoint,
            140,
            0,
            true,
            0, 6.28,
            20, 35,
            0.25, 0.8,
            0, 0,
            0.01, 0.02,
            0.01, 0.1,
        );
        dust.create(
            this.globalX,
            this.globalY,
            () => new PIXI.Sprite(loader.resources['bloodParticle'].texture),
            player.viewpoint,
            25,
            0,
            true,
            0, 6.28,
            12, 24,
            1.5, 2,
            0.01, 0.02,
            0.01, 0.02,
        );
        charm.fadeOut(this.entityGraphic, 30).onComplete = () => {
            this.delete();
        }
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

    delete() { // delete user when disconnected
        let entityGraphic = this.entityGraphic;
        player.viewpoint.removeChild(entityGraphic);
    }
}