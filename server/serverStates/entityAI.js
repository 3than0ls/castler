module.exports = class EntityAI {
    constructor(entityID, entityState) {
        this.entityID = entityID;
        this.entityState = entityState;

        // AI variables
        this.actionTicker = 0;
        this.actionTimer = 100;

        // movement variables
        // rotate
        this.stopAngle = 0;
        this.rotateFinish = true;
        // walk 
        this.speed = this.entityState.speed || 2;
        this.distance = 0;
        this.stopDistance = 0;
        this.walkFinish = true;
        // avoid
        this.avoidResourceDistance = 300;
    }

    tick() {
        this.actionTicker++;
    }

    decideAction() {
        let decision = "walk"; // testing purposes
        let random = Math.round(Math.random() * 10);
        if (random > 0 && random < 7) {
            this.rotateFinish = false; // rotate
            this.stopAngle = Math.round((Math.random() - 0.5) * 300); // 300 rather than 360, that way entities won't do a full (or close) turnaround
        }
        if (random > 3 && random < 10) {
            this.walkFinish = false; // move
            this.stopDistance = Math.round(Math.random() * 100);
            if (this.stopDistance < 25) this.stopDistance = 25;
        }
        
        return decision;
    }

    avoidResources(serverStateResources) {
        let resourceIDs = Object.keys(serverStateResources);
        for (let i = 0; i < resourceIDs.length; i++) {
            let a = this.entityState.globalX-serverStateResources[resourceIDs[i]].globalX;
            let b = this.entityState.globalY-serverStateResources[resourceIDs[i]].globalY;
            let distance = Math.hypot(a, b)
            if (distance < this.avoidResourceDistance) { // if the entity's distance from a resource is less than the avoidDistance length
                this.stopAngle = (-Math.atan2(
                    this.entityState.globalY - serverStateResources[resourceIDs[i]].globalY,
                    this.entityState.globalX - serverStateResources[resourceIDs[i]].globalX
                )) * 180 / Math.PI;
                this.stopDistance = 3;
                this.rotateFinish = false;
                this.walkFinish = false;
            }
        }
    }

    rotate() {
        if (this.entityState.angle < this.stopAngle) {
            this.entityState.angle += this.speed;
            if (this.entityState.angle >= this.stopAngle) {
                this.rotateFinish = true;
            }
        } else if (this.entityState.angle >= this.stopAngle) {
            this.entityState.angle -= this.speed;
            if (this.entityState.angle <= this.stopAngle) {
                this.rotateFinish = true;
                this.entityState.angle = this.stopAngle;
            }
        }
    }

    walk() {
        if (this.distance >= this.stopDistance) {
            this.walkFinish = true;
            this.distance = 0;
        } else {
            this.distance++;
            this.entityState.globalX += Math.sin(this.entityState.angle * (Math.PI/180)) * this.speed;
            this.entityState.globalY += -Math.cos(this.entityState.angle * (Math.PI/180)) * this.speed;
    
        }
    }

    attacked(damage, vx, vy) {
        this.entityState.health -= damage;
        this.entityState.globalX += vx;
        this.entityState.globalY += vy;

        this.walkFinish = true;
        this.stopDistance = 0;
        this.rotateFinish = true;
        this.entityState.stopAngle = this.entityState.angle;
    }

    move() {
        // sort of an AI for the entity
        if (this.entityState.neutrality === "passive") {
            this.decideAction();
        }
    }

    update(serverState) {
        this.tick();

        if (this.actionTicker >= this.actionTimer) {
            this.move();
            this.actionTimer = Math.floor(Math.random() * (800 - 100 + 1) + 100); // gen random number betwee 100 and 800
            this.actionTicker = 0;
        }

        this.avoidResources(serverState.resources);

        if (!this.rotateFinish) {
            this.rotate();
        }
        if (!this.walkFinish) {
            this.walk();
        }
    }
}
