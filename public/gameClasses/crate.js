import { player } from "../app";
import { loader } from "../utils/loader";

export class Crate {
    constructor(crateID, contents, globalX, globalY) {
        this.crateID = crateID;
        this.contents = contents;

        this.globalX = globalX;
        this.globalY = globalY;
    }

    render() {
        this.crateGraphic = new PIXI.Sprite(loader.resources['structures/crate'].texture); // sprite to be moved elsewhere

        // set positions
        this.crateGraphic.anchor.x = 0.5; 
        this.crateGraphic.anchor.y = 0.5;
        this.crateGraphic.position.set(this.globalX, this.globalY);

        // set zIndex (the parent container, player.viewpoint, enables sortable children)
        this.crateGraphic.zIndex = 25;

        player.viewpoint.addChild(this.crateGraphic);
    }

    looted() {
        // create a particle effect where the the crate smokes up when fully looted
    }
    
    update(contents, globalX, globalY) {
        this.globalX = globalX;
        this.globalY = globalY;
        this.contents = contents;

        // add graphics to stage   
        player.viewpoint.addChild(this.crateGraphic);
    }

    delete() {
        player.viewpoint.removeChild(this.crateGraphic);
    }
}