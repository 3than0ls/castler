import { charm } from "../vendors/charm/charm";

export class ClientStates {
    constructor(player) {
        let emptyClientState = {
            enemies: {},
            resources: {},
            entities: {},
            areas: {},
            structures: {},
            crates: {},
        
            timeTick: undefined,
        }
        Object.assign(this, emptyClientState);
        this.player = player;
        this.size = [];

        this.dayTimeLength;

        this.leaderboardState = [];
        this.craftableItemsState = [];

        // Web Worker to updated our game
        this.worker = new Worker('./../worker/worker.js', { type: 'module' });
    }

    resize(size) {
        this.size = size;
    }

    render(stage) {
        this.boundaryRect = new PIXI.Graphics();
        this.boundaryRect.lineStyle(4, 0x000000, 0.3);
        this.boundaryRect.drawRect(0, 0, this.size[0], this.size[1]);
        this.boundaryRect.zIndex = -1;
        this.boundaryRect.pivot.x = this.size[0]/2;
        this.boundaryRect.pivot.y = this.size[1]/2;

        this.background = new PIXI.Graphics();
        this.background.beginFill(0x3d7d00);
        this.background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        this.background.endFill();
        this.background.zIndex = -5;

        this.player.viewpoint.addChild(this.boundaryRect);
        stage.addChild(this.background);
    }

    timeInit(dayTimeLength, timeTick, stage) {
        this.dayTimeLength = dayTimeLength;
        this.timeTick = timeTick;
        if (!this.colorMatrix) {
            this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
            stage.filters = [this.colorMatrix];
            if (this.timeTick > this.dayTimeLength/2) {
                this.colorMatrix.brightness(0.1);
            } 
        }
    }

    cycleNight(stage) {
        if (this.timeTick === 0) {
            charm.filter(stage, 'brightness', 0.1, 1, this.dayTimeLength/10);
        } else if (this.timeTick === this.dayTimeLength/2) {
            charm.filter(stage, 'brightness', 1, 0.1, this.dayTimeLength/10);
        }
    }
}