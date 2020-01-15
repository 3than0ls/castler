import { player } from "../app";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";

export class Structure {
    constructor(structureID, config) {
        this.structureID = structureID;

        this.globalX = config.globalX;
        this.globalY = config.globalY;

        this.type = config.type;
        this.size = config.size;

        this.primaryColor = config.primaryColor;
    }

    render() {
        /*/ this.structureGraphic = new PIXI.Graphics();

        // this.structureGraphic.pivot.x = this.size[0]/2;
        // this.structureGraphic.pivot.y = this.size[1]/2;

        this.structureGraphic.beginFill(this.primaryColor);
        this.structureGraphic.drawRect(this.globalX, this.globalY, this.size[0], this.size[1]);
        this.structureGraphic.endFill();*/

        this.structureGraphic = new PIXI.Sprite(loader.resources['structures/mine'].texture);
        this.structureGraphic.anchor.x = 0.5;
        this.structureGraphic.anchor.y = 0.5;
        this.structureGraphic.position.set(this.globalX, this.globalY);

        this.structureGraphic.zIndex = -1;

        player.viewpoint.addChild(this.structureGraphic);
    }

    animate() {
        player.viewpoint.addChild(this.structureGraphic);
    }
}
