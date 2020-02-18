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
        this.particleType;
        switch (this.type) {
            case 'workbench':
            case 'wall':
                this.particleType = 'splinter';
                break;
            case 'furnace':
                this.particleType = 'stone';
                break;
            default: 
            this.particleType = 'splinter';
        }

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
            () => new PIXI.Sprite(loader.resources['particles/'.concat(this.particleType).concat('Particle')].texture),
            player.viewpoint,
            85,
            0,
            true,
            0, 6.28,
            12, 24,
            0.75, 1.25,
            0.005, 0.01,
            0.005, 0.01, // sometimes for a split second, it renders over the resource sprite, fix?
            0.1, 0.2
        );
    }
    
    emit() {
        if (!this.particleStream) {
            if (this.type === 'furnace') {
                this.particleStream = dust.emitter(
                    240, () => {
                        dust.create(
                            this.globalX+15*(Math.random()-0.5),
                            this.globalY+15*(Math.random()-0.5),
                            () => {
                                let sprite = new PIXI.Sprite(loader.resources['particles/smokeParticle'].texture);
                                sprite.tint = 0x232323;
                                return sprite;
                            },
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
        dust.create(
            this.globalX,
            this.globalY,
            () => new PIXI.Sprite(loader.resources['particles/'.concat(this.particleType).concat('Particle')].texture),
            player.viewpoint,
            75,
            0,
            true,
            0, 6.28,
            10, 35,
            1.5, 3,
            0.015, 0.04,
            0.015, 0.04,
        );
        charm.fadeOut(this.structureGraphic, 30).onComplete = () => {
            player.viewpoint.removeChild(this.structureGraphic);
        }
    }
}
