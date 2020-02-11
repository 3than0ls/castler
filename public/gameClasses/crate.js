import { player } from "../app";
import { loader } from "../utils/loader";
import { dust } from "../dust/dust";
import { charm } from "../charm/charm";

export class Crate {
    constructor(crateID, contents, globalX, globalY) {
        this.crateID = crateID;
        this.contents = contents;

        this.globalX = globalX;
        this.globalY = globalY;

        this.particleStream;
    }

    render() {
        this.crateGraphic = new PIXI.Sprite(loader.resources['structures/crate'].texture); // sprite to be moved elsewhere
        this.crateGraphic.circular = true; // bump js settings

        // set positions
        this.crateGraphic.anchor.x = 0.5; 
        this.crateGraphic.anchor.y = 0.5;
        this.crateGraphic.position.set(this.globalX, this.globalY);

        // set zIndex (the parent container, player.viewpoint, enables sortable children)
        this.crateGraphic.zIndex = 5;

        player.viewpoint.addChild(this.crateGraphic);
    }

    looted() {
        // create a particle effect where the the crate smokes up when fully looted
        dust.create(
            this.globalX,
            this.globalY,
            () => new PIXI.Sprite(loader.resources['particles/crateParticle'].texture),
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
    }
    
    emit() {
        if (!this.particleStream) {
            this.particleStream = dust.emitter(
                240, () => {
                    dust.create(
                        this.globalX,
                        this.globalY,
                        () => {
                            let sprite = new PIXI.Sprite(loader.resources['particles/smokeParticle'].texture);
                            sprite.tint = 0x510e0e;
                            return sprite
                        },
                        player.viewpoint,
                        Math.max(2, Math.ceil((Object.values(this.contents)[0].amount/20))),
                        0,
                        true,
                        0, 6.28,
                        4, 15,
                        0.4, 0.7,
                        -0.009, -0.01,
                        0.0075, 0.0225,
                    )
                }
            )
            this.particleStream.play();
            
        }
    }
    
    update(contents, globalX, globalY) {
        this.globalX = globalX;
        this.globalY = globalY;
        this.contents = contents;

        this.emit();

        // add graphics to stage   
        player.viewpoint.addChild(this.crateGraphic);
    }

    delete() {
        this.looted();
        if (this.particleStream) {
            this.particleStream.stop();
        }
        charm.fadeOut(this.crateGraphic, 30).onComplete = () => {
            player.viewpoint.removeChild(this.crateGraphic);
        }
    }
}