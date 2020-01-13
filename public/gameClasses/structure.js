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

        /*
        this.wallGraphics = config.walls.map((item) => {
            let wallGraphic = new PIXI.Graphics();

            wallGraphic.pivot.x = -this.globalX+this.size[0]/2;
            wallGraphic.pivot.y = -this.globalY+this.size[1]/2;
            wallGraphic.zIndex = 0;
            
            wallGraphic.lineStyle(4, 0x000000);
            wallGraphic.beginFill(item.primaryColor);
            wallGraphic.drawRect(item.globalX, item.globalY, item.size[0], item.size[1]);
            wallGraphic.endFill();

            return wallGraphic;
        });*/
    }

    wallCollide(playerGraphic) { // wip, does not work
        // elements of wall graphic are pixi sprites that have had their positions set
        const returned = [];
        for (let i = 0; i < this.wallGraphics.length; i++) {
            let hit = bump.circleRectangleGameCollision(this.wallGraphics[i], playerGraphic, false, true);
            returned.push(hit);
        }
        return returned;
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
