import { player } from "../app";
import { loader } from "../utils/loader";
import { dust } from "../dust/dust";

export class Area {
    constructor(areaID, config) {
        this.areaID = areaID;

        this.globalX = config.globalX;
        this.globalY = config.globalY;

        this.type = config.type;
        this.size = config.size;

        this.particleStream;
    }

    render() {
        this.areaGraphic = new PIXI.Sprite(loader.resources[`areas/${this.type}`].texture);
        this.areaGraphic.anchor.x = 0.5;
        this.areaGraphic.anchor.y = 0.5;
        this.areaGraphic.position.set(this.globalX, this.globalY);

        this.areaGraphic.zIndex = -1;

        player.viewpoint.addChild(this.areaGraphic);
    }

    animate() {
        player.viewpoint.addChild(this.areaGraphic); // may be unnecesary
    }
}
