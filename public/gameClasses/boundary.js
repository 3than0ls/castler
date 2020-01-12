import { player } from "../app";

export class Boundary {
    constructor() {
        this.size = [];
    }

    resize(size) {
        this.size = size;
    }

    renderBoundary() {
        this.boundaryRect = new PIXI.Graphics();

        // draw thin transparent black line edges for boundary boxes
        this.boundaryRect.lineStyle(4, 0x000000, 0.3);
        this.boundaryRect.drawRect(0, 0, this.size[0], this.size[1]);

        
        this.boundaryRect.pivot.x = this.size[0]/2;
        this.boundaryRect.pivot.y = this.size[1]/2;


        player.viewpoint.addChild(this.boundaryRect);
    }

    updateBoundary() {
        player.viewpoint.addChild(this.boundaryRect);
    }
}