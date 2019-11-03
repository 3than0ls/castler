import { stage } from "./../game.js";
import { loader } from "./../loader.js";

export class Castle {
    constructor(clientID) {
        this.x = 500;
        this.y = 500;
        this.clientID = clientID;

    }
    render() {
        this.graphic = new PIXI.Sprite(loader.resources[`assets/blueCastle.png`].texture);
        // instantiation
        this.graphic.anchor.x = 0.5;
        this.graphic.anchor.y = 0.5;
        this.graphic.position.set(this.x, this.y);
        console.log('rendered');
        
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