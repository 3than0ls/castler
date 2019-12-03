import { player } from "../game";
import { loader } from "../utils/loader";

export class Entity {
    constructor(entityID, type, nuetrality, globalX, globalY) {
        this.type = type;
        this.nuetrality = nuetrality;
        this.entityID = entityID;

        this.globalX = globalX;
        this.globalY = globalY;
    }

    render() {
        this.entityGraphic = new PIXI.Sprite(loader.resources[this.type].texture);
        this.entityGraphic.circular = true; // bump js settings
        this.entityGraphic.radius = this.entityGraphic.width * 0.798;
        
        // set positions
        this.entityGraphic.anchor.x = 0.5; 
        this.entityGraphic.anchor.y = 0.5;
        this.entityGraphic.position.set(this.globalX, this.globalY);

        let entityGraphic = this.entityGraphic;
        player.viewpoint.addChild(entityGraphic); // hands drawn below body
    }
    
    animate(globalX, globalY, angle, nuetrality) {
        // update positioning
        this.globalX = globalX;
        this.globalY = globalY;
        this.entityGraphic.position.set(this.globalX, this.globalY);

        this.angle = angle;
        this.entityGraphic.angle = this.angle;
        console.log(this.angle);
        
        // add graphics to stage
        let entityGraphic = this.entityGraphic;       
        player.viewpoint.addChild(entityGraphic); // hands drawn below body
    }
}