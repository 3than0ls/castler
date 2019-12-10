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
        this.difference;
        // walk 
        this.speed = this.entityState.speed || 2;
        this.angeredSpeed = this.speed * 2;
        this.distance = 0;
        this.stopDistance = 0;
        this.walkFinish = true;
        // avoid
        this.avoidResourceDistance = 200;
        switch (entityState.type) {
            case 'duck':
                this.avoidResourceDistance = (100 + 200)/2; // duck width plus resource width, divided by two
                break;
            case 'boar':
                this.avoidResourceDistance = (150 + 200)/2;
                break;
            default:
                this.avoidResourceDistance = 350;
                break;
        }
        this.resourceCollision = false;
        // neutrality variables
        this.aggroDistance = 500;
        this.hit = false;
        this.target;
    }

    tick() {
        this.actionTicker++;
    }

    decideAction() {
        if (!this.angered) {
            let random = Math.round(Math.random() * 10);
            if (random >= 0 && random < 7) {
                this.rotate(Math.round((Math.random() - 0.5) * 300)); // 300 rather than 360, that way entities won't do a full (or close) turnaround
            }
            if (random > 3 && random <= 10) {
                let stopDistance = (Math.random() * 100)
                this.walk((stopDistance > 25) ? stopDistance : 25);
            }
        }
    }

    detectTarget(radius) {
        let a = this.entityState.globalX-this.target.globalX;
        let b = this.entityState.globalY-this.target.globalY;
        let distance = Math.hypot(a, b);
        if (distance < radius) { // if the entity's distance from a resource is less than the avoidDistance length
            return true;
        } else {
            return false;
        }
    }
    
    avoidResources(serverStateResources) {
        let resourceIDs = Object.keys(serverStateResources);
        for (let i = 0; i < resourceIDs.length; i++) {
            let a = this.entityState.globalX - serverStateResources[resourceIDs[i]].globalX;
            let b = this.entityState.globalY  -serverStateResources[resourceIDs[i]].globalY;
            let distance = Math.hypot(a, b);
            
            let avoidResourceDistance = this.hit ? this.avoidResourceDistance + 50 : this.avoidResourceDistance; 
            if (distance < this.avoidResourceDistance) { // if the entity's distance from a resource is less than the avoidDistance length
                this.resourceCollision = true;
                let a = (Math.round((Math.atan2(
                    this.entityState.globalY - serverStateResources[resourceIDs[i]].globalY,
                    this.entityState.globalX - serverStateResources[resourceIDs[i]].globalX
                )) * 180 / Math.PI) - this.entityState.angle + 90);
                if (a >= 180) {
                    a -= 360;
                } else if (a <= -180) {
                    a += 360;
                }
                if (this.hit) a /= 27; // if the entity was hit/aggroed, decrease the angle to compensate for the angle it takes for following the player
                this.rotate(a, 5);
            } else {
                this.resourceCollision = false;
            }
        }
    }

    rotate(stopAngle=0, thenWalk=false, override=true) {
        let speed = this.hit ? this.angeredSpeed : this.speed;
        if (stopAngle !== 'updateCall') { // if it isn't an update call
            if ((this.rotateFinish || override) && (stopAngle > speed || stopAngle < -speed)) { // if it completed, overriden, or significant
                this.thenWalk = thenWalk;
    
                this.stopAngle = stopAngle;
                this.angle = 0;
                this.initAngle = this.entityState.angle;
                this.rotateFinish = false;
            }
        } else {
            if (this.stopAngle < 0) { // turn left
                if (this.angle >= this.stopAngle) {
                    this.angle -= speed;
                    this.entityState.angle -= speed;
                    this.rotateFinish = false; // <--, may be un needed
                } else {
                    this.rotateFinish = true;
                    //this.entityState.angle = this.initAngle - this.stopAngle;
                }
            } else if (this.stopAngle >= 0) {
                if (this.angle <= this.stopAngle) {
                    this.angle += speed;
                    this.entityState.angle += speed;
                    this.rotateFinish = false; // <--, may be un needed
                } else {
                    this.rotateFinish = true;
                    //this.entityState.angle = this.initAngle + this.stopAngle;
                }
            }
        }
        /*
        if (this.entityState.angle < this.stopAngle) { // if the entity angle is greater than stop angle
            this.entityState.angle += this.speed; // turn right
            if (this.entityState.angle >= this.stopAngle) { // if the entity angle has reached the stop angle, then stop
                this.rotateFinish = true;
                this.entityState.angle = this.stopAngle;
            }
        } else if (this.entityState.angle >= this.stopAngle) { // of the entity angle is less than the stop angle
            this.entityState.angle -= this.speed; // turn left
            if (this.entityState.angle <= this.stopAngle) { // if the entity angle has reached the stop angle, then stop
                this.rotateFinish = true;
                this.entityState.angle = this.stopAngle;
            }
        }*/

        if (this.rotateFinish && this.thenWalk) {
            this.walk(this.thenWalk);
        }
    }

    walk(stopDistance=0, thenRotate=false, override=true) {
        if (stopDistance !== 'updateCall') {
            if (this.walkFinish || override) {
                this.thenRotate = thenRotate;
                this.stopDistance = stopDistance;
                this.distance = 0;
                this.walkFinish = false;
            }
        } else {
            if (this.distance < this.stopDistance) {
                let speed = this.hit ? this.angeredSpeed : this.speed;
                this.distance += speed;
                this.entityState.globalX += Math.sin(this.entityState.angle * (Math.PI/180)) * speed;
                this.entityState.globalY += -Math.cos(this.entityState.angle * (Math.PI/180)) * speed;
                this.walkFinish = false;
            } else {
                this.walkFinish = true;
                this.distance = 0;
                this.stopDistance = 0;
            }
            if (this.walkFinish && this.thenRotate) {
                this.rotate(this.thenRotate);
            }
        }
    }

    attacked(damage, vx, vy, player) {
        this.entityState.health -= damage;
        /*this.entityState.globalX += vx;
        this.entityState.globalY += vy;*/
        // stop the animal
        //this.walk(0);
        //this.rotate(0);
        this.target = player;
        this.hit = true;
    }

    flee(distance=this.aggroDistance) {
        let a = Math.round((Math.atan2(
            this.entityState.globalY - this.target.globalY,
            this.entityState.globalX - this.target.globalX
        )) * 180 / Math.PI) - this.entityState.angle + 90;
        if (a >= 180) {
            a -= 360;
        } else if (a <= -180) {
            a += 360;
        }
        if (!this.resourceCollision) {
            this.rotate(a);
        }
        this.walk(5);
        if (!this.detectTarget(this.aggroDistance)) {
            this.hit = false;
        }
    }

    attack() {
        let a = Math.round((Math.atan2(
            this.entityState.globalY - this.target.globalY,
            this.entityState.globalX - this.target.globalX
        )) * 180 / Math.PI) - this.entityState.angle - 90;
        if (a >= 180) {
            a -= 360;
        } else if (a <= -180) {
            a += 360;
        }
        if (!this.resourceCollision) {
            this.rotate(a);
        }
        this.walk(5);
        if (!this.detectTarget(this.aggroDistance)) {
            this.hit = false;
        }
    }

    move() {
        // sort of an AI for the entity
        if (this.entityState.neutrality === "passive" || this.entityState.neutrality === "neutral") {
            this.decideAction();
        }
    }

    update(serverState) {
        this.tick();
        
            
        if (this.entityState.angle >= 360) { // prevents angle from going to values greater or less than 360 or -360
            this.entityState.angle -= 360;
        } else if (this.entityState.angle <= -360) {
            this.entityState.angle += 360;
        }
        

        if (this.hit) {
            if (this.entityState.neutrality === "passive") {
                this.flee();
            } else if (this.entityState.neutrality === "neutral") {
                this.attack();
            }
        } else if (this.actionTicker >= this.actionTimer) {
            this.move();
            this.actionTimer = Math.floor(Math.random() * (300 - 100 + 1) + 100); // gen random number betwee 100 and 800
            this.actionTicker = 0;
        }
        
        this.avoidResources(serverState.resources);
        
        this.walk('updateCall');
        this.rotate('updateCall');
    }
}
