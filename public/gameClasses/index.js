import { charm } from "../vendors/charm/charm";
import { stage, globalContainer } from "../app";
import { ratio } from "../utils/windowResize";

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

    render(size) {
        this.size = size;

        this.boundaryRect = new PIXI.Graphics();
        this.boundaryRect.lineStyle(4, 0x343434, 0.3);
        this.boundaryRect.drawRect(0, 0, this.size[0], this.size[1]);
        this.boundaryRect.zIndex = 100;
        this.boundaryRect.pivot.x = this.size[0]/2;
        this.boundaryRect.pivot.y = this.size[1]/2;

        this.background = new PIXI.Graphics();
        this.background.beginFill(0x3d7d00);
        this.background.drawRect(0, 0, window.innerWidth/ratio, window.innerHeight/ratio);
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
                this.colorMatrix.brightness(0.15);
            } 
        }
    }

    resize() {
        if (!this.background) {
            this.background = new PIXI.Graphics();
        } else {
            this.background.clear();
        }
        this.background.beginFill(0x3d7d00);
        this.background.drawRect(0, 0, window.innerWidth/ratio, window.innerHeight/ratio);
        this.background.endFill();
        this.background.zIndex = -5;
        stage.addChild(this.background);
    }

    update() {
        let transitionTime = this.dayTimeLength/10 > 600 ? 600 : this.dayTimeLength/10;
        if (this.timeTick === 0) {
            this.colorMatrix.brightness(0.15);
            if (this.nightTransition) {
                this.nightTransition.pause();
            }
            this.dayTransition = charm.filter(stage, 'brightness', 0.15, 1, transitionTime);
        } else if (this.timeTick === this.dayTimeLength/2) {
            if (this.dayTransition) {
                dayTransition.pause();
            }
            this.colorMatrix.brightness(1);
            this.nightTransition = charm.filter(stage, 'brightness', 1, 0.15, transitionTime);
        }
    }
}