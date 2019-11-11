import { socket, player } from "../game";
import { loader } from "../utils/loader";
import { bump } from "../bump/bump";
import { ratio, gameWidth } from "../utils/windowResize";

export class Resource {
    constructor(resourceID, type, amount, globalX, globalY) {
        this.type = type;
        this.resourceID = resourceID;
        this.amount = amount;

        this.globalX = globalX;
        this.globalY = globalY;
    }

    render() {
        this.resourceGraphic = new PIXI.Sprite(loader.resources[this.type].texture);
        this.resourceGraphic.circular = true; // bump js settings
        
        // set positions
        this.resourceGraphic.anchor.x = 0.5; 
        this.resourceGraphic.anchor.y = 0.5;
        this.resourceGraphic.position.set(this.globalX, this.globalY);

        let resourceGraphic = this.resourceGraphic;
        player.viewpoint.addChild(resourceGraphic); // hands drawn below body
    }

    collide(playerGraphic) {
        bump.circleCollision(this.resourceGraphic, playerGraphic, true, true);
    }

    harvest() {
        socket.emit('resourceHarvest', {
            resourceID: this.resourceID,
            amount: this.amount,
            globalX: this.globalX,
            globalY: this.globalY,
        });
    }
    
    animate(globalX, globalY, amount) {
        // update positioning
        this.globalX = globalX;
        this.globalY = globalY;
        // update amount
        this.amount = amount;

        // add graphics to stage
        let resourceGraphic = this.resourceGraphic;       
        player.viewpoint.addChild(resourceGraphic); // hands drawn below body
    }
}