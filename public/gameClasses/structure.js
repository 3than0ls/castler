import { player } from "../app";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";
import { charm } from "../charm/charm";
import { dust } from "../dust/dust";

export class Structure {
    constructor(areaID, globalX, globalY, type) {
        this.areaID = areaID;

        this.globalX = globalX;
        this.globalY = globalY;

        this.type = type;
        this.particleStream;

        this.tweenTick = 0;
    }

    collide(playerGraphic) {
        return bump.circleGameCollision(this.structureGraphic, playerGraphic, false, true);
    }

    render() {
        this.structureGraphic = new PIXI.Sprite(loader.resources[`structures/${this.type}`].texture);
        this.structureGraphic.anchor.x = 0.5;
        this.structureGraphic.anchor.y = 0.5;
        this.structureGraphic.position.set(this.globalX, this.globalY);
        this.structureGraphic.zIndex = 26;
        this.structureGraphic.circular = true; // bump js settings

        this.structureGraphic.zIndex = -1;

        player.viewpoint.addChild(this.structureGraphic);
    }

    hit(vx, vy, collisionX, collisionY, harvestSpeed) {
        // create an effect where the resource appears to have bumped when hit
        let waypoints = [
            [this.globalX, this.globalY],
            [this.globalX+vx, this.globalY+vy],
            [this.globalX, this.globalY]
        ]
        this.tweenTick++; // start tween tick so server update doesn't affect charm animation
        charm.walkPath(this.structureGraphic, waypoints, harvestSpeed * 10, "smoothstep");

        if (this.tweenTick > harvestSpeed * 10 * (waypoints.length-1)) {
            this.tweenTick = 0;
        }
        
        // emit particle when hit
        dust.create(
            collisionX,
            collisionY,
            () => new PIXI.Sprite(loader.resources['particles/'.concat((this.resourceName ? this.structureName : 'stone').concat('Particle'))].texture),
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
    
    emit() {
        if (!this.particleStream) {
            if (this.type === 'furnace') {
                this.particleStream = dust.emitter(
                    160, () => {
                        dust.create(
                            this.globalX,
                            this.globalY,
                            () => new PIXI.Sprite(loader.resources['particles/smokeParticle'].texture),
                            player.viewpoint,
                            2,
                            0,
                            true,
                            0, 6.28,
                            20, 60,
                            0.4, 0.7,
                            -0.003, -0.008,
                            0.0025, 0.0075,
                        )
                    }
                )
                this.particleStream.play();
            }
        }
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

        this.emit();
        player.viewpoint.addChild(this.structureGraphic);
    }

    delete() {
        if (this.particleStream) {
            this.particleStream.stop();
        }
        player.viewpoint.removeChild(this.structureGraphic);
    }
}
