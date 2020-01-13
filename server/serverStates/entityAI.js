const imageSize = require('image-size');

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
        // radius
        switch (entityState.type) {
            case 'duck':
                this.radius = (imageSize('./public/assets/entities/duck.png').width * 0.798)/2; // pre calculated values also found in entity.js, when defining entityGraphic radius
                break;
            case 'boar':
                this.radius = (imageSize('./public/assets/entities/boar.png').width * 0.827)/2;
                break;
            case 'beetle':
                this.radius = (imageSize('./public/assets/entities/beetle.png').width * 0.883)/2;
                break;
            default:
                this.radius = 100;
                break;
        }
        // avoid
        this.avoidResourceDistance = this.radius + (200/2) // entity radius plus resource radius
        this.resourceCollision = false;
        // neutrality variables
        this.aggroDistance = 500;
        this.hit = false;
        this.target;
        this.targetSocket;
        this.attackTargetRadius;
        // attack
        this.attackSpeed = 100;
        this.attackTick = 100;
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

    avoidStructure(serverStateStructures) {
        for (let [structureID, structure] of Object.entries(serverStateStructures)) {
            let entityInsideStructure = structure.objectInsideStructure(this.entityState); // keep out external entities
            // if the entity is inside the structure, the structure is not the entities home structure, and the entity has not been hit, then turn it away from structure
            if (entityInsideStructure && this.entityState.homeStructureID !== structureID && !this.hit) {
                let angle = (Math.round((Math.atan2(
                    this.entityState.globalY - structure.globalY,
                    this.entityState.globalX - structure.globalX
                )) * 180 / Math.PI) - this.entityState.angle + 90);
                if (angle >= 180) {
                    angle -= 360;
                } else if (angle <= -180) {
                    angle += 360;
                }
                this.rotate(angle, 3);
                break;
            } else if (!entityInsideStructure && this.entityState.homeStructureID === structureID && !this.hit) {
                // if the entity is outsude the structure and the structure is the entities home structure, and the entity has not been hit, then turn it owards the structure
                // perhaps create hard limit on how far an entity can leave its structure even if it has been hit
                let angle = (Math.round((Math.atan2(
                    this.entityState.globalY - structure.globalY,
                    this.entityState.globalX - structure.globalX
                )) * 180 / Math.PI) - this.entityState.angle - 90);
                if (angle >= 180) {
                    angle -= 360;
                } else if (angle <= -180) {
                    angle += 360;
                }
                this.rotate(angle, 3);
                break;
            }
        }
    }
    
    avoidResources(serverStateResources) {
        let resourceIDs = Object.keys(serverStateResources);
        for (let i = 0; i < resourceIDs.length; i++) { // as the index decreases, it seems like the calculations get rougher
            const serverStateResource = serverStateResources[resourceIDs[i]]
            const a = this.entityState.globalX - serverStateResource.globalX;
            const b = this.entityState.globalY - serverStateResource.globalY;
            let distance = Math.hypot(a, b);
            
            if (distance < this.avoidResourceDistance+15) {
                this.resourceCollision = true;
                let angle = (Math.round((Math.atan2(
                    this.entityState.globalY - serverStateResources[resourceIDs[i]].globalY,
                    this.entityState.globalX - serverStateResources[resourceIDs[i]].globalX
                )) * 180 / Math.PI) - this.entityState.angle + 90);
                if (angle >= 180) {
                    angle -= 360;
                } else if (angle <= -180) {
                    angle += 360;
                }
                if (this.hit) {
                    angle /= 1; // if the entity was hit/aggroed, decrease the angle to compensate for the angle it takes for following the player
                }
                this.rotate(angle, 1);
                break
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

    targetExists() {
        if (!this.target) {
            return false;
        }
        if (this.target.dead) {
            return false;
        }
        return true;
    }

    attacked(damage, player) {
        this.entityState.health -= damage;
        /*this.entityState.globalX += vx;
        this.entityState.globalY += vy;*/
        // stop the animal
        //this.walk(0);
        //this.rotate(0);
        this.target = player;
        this.hit = true;
    }

    flee() {
        // rotate
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
        // walk whilst rotating
        this.walk(5);
        // if target outside of aggro distance, then untarget and reset hit
        if (!this.detectTarget(this.aggroDistance)) {
            this.target = undefined;
            this.hit = false;
        }

        // if target has died, than untarget and reset hit
        if (!this.targetExists()) {
            this.target = undefined;
            this.hit = false;
            this.attackTick = this.attackSpeed;
        }
    }

    attack() {
        // rotate
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
        // walk towards target, whilst rotating
        this.walk(5);
        // if target outside of aggro distance and target exists, then untarget it and reset attack tick to attack speed to ready for next attack
        if (!this.detectTarget(this.aggroDistance)) {
            this.target = undefined;
            this.hit = false;
            this.attackTick = this.attackSpeed;
        } else {
            // tick the attack ticker
            this.attackTick++;
            this.target.attackFlash = false; // set to true in this.target.attacked, used so that clients can see when other clients are attacked

            // if target is within attacking range, then attack
            this.attackTargetRadius = this.target.radius + this.radius;
            if (this.detectTarget(this.attackTargetRadius + 7)) { // 7 is an extra padding space
                if (this.attackTick >= this.attackSpeed) {
                    this.target.attacked(6);
                    this.attackTick = 0;
                }
            }
        }

        // if target has died, than untarget and reset hit
        if (!this.targetExists()) {
            this.target = undefined;
            this.hit = false;
            this.attackTick = this.attackSpeed;
        }
    }

    move() {
        // sort of an AI for the entity
        if (this.entityState.neutrality === "passive" || this.entityState.neutrality === "neutral") {
            this.decideAction();
        }
    }

    boundaryContain(boundarySize) {
        // rotate
        let a = Math.round((Math.atan2(
            this.entityState.globalY,
            this.entityState.globalX,
        )) * 180 / Math.PI) - this.entityState.angle - 90;
        if (a >= 180) {
            a -= 360;
        } else if (a <= -180) {
            a += 360;
        }

        if (this.entityState.globalX <= -boundarySize[0]/2 || this.entityState.globalX >= boundarySize[0]/2 ||
            this.entityState.globalY <= -boundarySize[1]/2 || this.entityState.globalY >= boundarySize[1]/2) {
            this.rotate(a, 15);
        }

        // if the entity has somehow gotten to a place way beyond the boundary, reset its position
        if (this.entityState.globalX <= -boundarySize[0]/2 - boundarySize[0]/3 || this.entityState.globalX >= boundarySize[0]/2 + boundarySize[0]/3 ||
            this.entityState.globalY <= -boundarySize[1]/2 - boundarySize[1]/3 || this.entityState.globalY >= boundarySize[1]/2 + boundarySize[1]/3) {
            this.entityState.globalX = 0;
            this.entityState.globalY = 0;
        }
    }

    update(serverState, map) {
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
        this.avoidStructure(serverState.structures);
        this.boundaryContain(map.size);

        
        this.walk('updateCall');
        this.rotate('updateCall');
    }
}
