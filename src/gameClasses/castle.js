import { stage } from "./../game.js";
import { loader, assets } from "./../loader.js";

export class Castle {
    constructor(clientID) {
        this.x = 500;
        this.y = 500;
        this.clientID = clientID;

    }
    render() {
        //console.log(JSON.stringify(loader.resources));
        this.graphic = new PIXI.Sprite(loader.resources['blueCastle'].texture);
        // instantiation
        this.graphic.anchor.x = 0.5;
        this.graphic.anchor.y = 0.5;
        this.graphic.position.set(this.x, this.y);
        
        let graphic = this.graphic;
        stage.addChild(graphic);
    }

    update() {
        this.x = this.graphic.x;
        this.y = this.graphic.y;
        
        let graphic = this.graphic;
        stage.addChild(graphic);
    }
}