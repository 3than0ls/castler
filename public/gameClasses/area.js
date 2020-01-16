import { player } from "../app";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";

export class Area {
    constructor(areaID, config) {
        this.areaID = areaID;

        this.globalX = config.globalX;
        this.globalY = config.globalY;

        this.type = config.type;
        this.size = config.size;

        this.primaryColor = config.primaryColor;
    }

    render() {
        /*/ this.areaGraphic = new PIXI.Graphics();

        // this.areaGraphic.pivot.x = this.size[0]/2;
        // this.areaGraphic.pivot.y = this.size[1]/2;

        this.areaGraphic.beginFill(this.primaryColor);
        this.areaGraphic.drawRect(this.globalX, this.globalY, this.size[0], this.size[1]);
        this.areaGraphic.endFill();*/

        this.areaGraphic = new PIXI.Sprite(loader.resources[`areas/${this.type}`].texture);
        this.areaGraphic.anchor.x = 0.5;
        this.areaGraphic.anchor.y = 0.5;
        this.areaGraphic.position.set(this.globalX, this.globalY);

        this.areaGraphic.zIndex = -1;

        player.viewpoint.addChild(this.areaGraphic);
    }

    animate() {
        player.viewpoint.addChild(this.areaGraphic);
    }
}
