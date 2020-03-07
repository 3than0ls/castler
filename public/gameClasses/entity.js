import { player } from "../app";
import { loader } from "../utils/loader";
import { bump } from "../vendors/bump/bump.js";
import { charm } from "../vendors/charm/charm";
import { dust } from "../vendors/dust/dust";

export class Entity {
    constructor(entityID, type, globalX, globalY) {
        this.type = type;
        this.entityID = entityID;

        this.alreadyHit = false;

        this.globalX = globalX;
        this.globalY = globalY;
    }

    render() {
        this.entityGraphic = new PIXI.Sprite(loader.resources['entities/'.concat(this.type)].texture);
        this.entityGraphic.circular = true; // bump js settings
        switch (this.type) {
            case "duck":
                this.entityGraphic.radius = (this.entityGraphic.width * 0.798)/2; // 0.798 is pre calculated
                break;
            case "boar": 
                this.entityGraphic.radius = (this.entityGraphic.width * 0.827)/2; // 0.798 is pre calculated
                break;
            case "beetle":
                this.entityGraphic.radius = (this.entityGraphic.width * 0.883)/2;
                break;
            case "frog":
                this.entityGraphic.radius = (this.entityGraphic.width * 0.865)/2;
                break;
        }
        
        // set positions
        this.entityGraphic.anchor.x = 0.5; 
        this.entityGraphic.anchor.y = 0.5;
        this.entityGraphic.position.set(this.globalX, this.globalY);

        // set zIndex (the parent container, player.viewpoint, enables sortable children)
        this.entityGraphic.zIndex = 15;

        let entityGraphic = this.entityGraphic;
        player.viewpoint.addChild(entityGraphic); // hands drawn below body
    }

    collide(playerGraphic) {
        return bump.circleGameCollision(this.entityGraphic, playerGraphic, true, true, 'entity');
    }

    handSpriteCollision(collisionPoint) {
        return bump.hitTestPoint(collisionPoint, this.entityGraphic);
    }

    hit(collisionX, collisionY) {
        if (this.entityGraphic.tint === 0xFFFFFF) {
            let tint = charm.tint(this.entityGraphic, [255, 120, 120], 25);
            tint.onComplete = () => {
                // reset tint to nothing
                this.entityGraphic.tint = 0xFFFFFF
            }
        }
        // emit particle when hit
        dust.create(
            collisionX,
            collisionY,
            () => new PIXI.Sprite(loader.resources['particles/bloodParticle'].texture),
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

    die() {
        // emit particle when died
        let deathParticle;
        switch (this.type) {
            case "duck":
                deathParticle = "feather";
                break;
            case "boar":
                deathParticle = "fur";
                break;
            default:
                deathParticle = "blood";
                break;
        }
        dust.create(
            this.globalX,
            this.globalY,
            () => new PIXI.Sprite(loader.resources['particles/'.concat(deathParticle).concat('Particle')].texture),
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
            () => new PIXI.Sprite(loader.resources['particles/bloodParticle'].texture),
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
    
    animate(globalX, globalY, angle) {
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