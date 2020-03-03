export class ClientStates {
    constructor(player) {
        let emptyClientState = {
            enemies: {},
            resources: {},
            entities: {},
            areas: {},
            structures: {},
            crates: {},
        
            timeTick: 0,
        }
        Object.assign(this, emptyClientState);
        this.player = player;
        this.size = [];

        this.leaderboardState = [];
        this.craftableItemsState = [];

        // Web Worker to updated our game
        this.worker = new Worker('./../worker/worker.js', { type: 'module' });
    }

    resize(size) {
        this.size = size;
    }

    renderBoundary() {
        this.boundaryRect = new PIXI.Graphics();

        // draw thin transparent black line edges for boundary boxes
        this.boundaryRect.lineStyle(4, 0x000000, 0.3);
        this.boundaryRect.drawRect(0, 0, this.size[0], this.size[1]);
        this.boundaryRect.zIndex = -1;

        
        this.boundaryRect.pivot.x = this.size[0]/2;
        this.boundaryRect.pivot.y = this.size[1]/2;


        this.player.viewpoint.addChild(this.boundaryRect);
    }

    cycleNight(stage) {
        if (!this.player.playerTintOverlay) {
            this.player.playerTintOverlay = new PIXI.Graphics();
            this.player.playerTintOverlay.beginFill(0x000000, 0.90);
            this.player.playerTintOverlay.drawRect(0, 0, 5000, 5000); // window.innerWidth/innerHeight have shown to be unreliable on edge, so we use this
            this.player.playerTintOverlay.endFill();
            this.player.playerTintOverlay.zIndex = 150;
        }
        // include day and night cycle
        if (this.timeTick < 5000) {
            // day time
            stage.removeChild(this.player.playerTintOverlay);
        } else if (this.timeTick >= 5000) { // look into pixi js masks, perhaps they can help recreate this effect of darkening
            stage.addChild(this.player.playerTintOverlay);
        }
    }
}