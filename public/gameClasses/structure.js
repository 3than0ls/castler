import { player } from "../app";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";

export class Structure {
    constructor(areaID, globalX, globalY, type) {
        this.areaID = areaID;

        this.globalX = globalX;
        this.globalY = globalY;

        this.type = type;
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

    animate() {
        player.viewpoint.addChild(this.structureGraphic);
    }
}
