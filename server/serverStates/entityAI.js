const collisions = require('./../collisions.js');

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class EntityAI {
    constructor(entityConfig, globalX, globalY, homeAreaID) {
        this.entityID = 'e' + Math.random().toString(36).substr(2, 9);;

        this.globalX = globalX;
        this.globalY = globalY;
        this.angle = 0;

        this.type = entityConfig.type;

        this.collisionvx = 0;
        this.collisionvy = 0;

        // entity config variables for entity AI
        this.damage = entityConfig.damage.valueOf();
        this.health = entityConfig.health.valueOf();
        // size
        this.size = entityConfig.size;
        // loot
        this.loot = entityConfig.loot;
        // speed 
        this.speed = entityConfig.speed.valueOf()// || 2;
        // neutrality
        this.neutrality = entityConfig.neutrality;


        // AI VARIABLES THAT CONTROL HOW THE ENTITY MOVES AND ACTS //
        this.actionTicker = 0;
        this.actionTimer = 100;

        // home area ID
        this.homeAreaID = homeAreaID || 'map';
        this.playerHit = false;

        // movement variables
        // rotate
        this.rotateAngle = 0;
        this.stopAngle = 0;
        this.rotateFinish = true;
        this.difference;
        // walk 
        this.angeredSpeed = this.speed * 2;
        this.distance = 0;
        this.stopDistance = 0;
        this.walkFinish = true;
        // avoid
        this.avoidPaddingDistance = 15; // used as a padding so entities hopefully avoid direct collision
        this.objectCollision = false;
        // neutrality variables
        this.aggroDistance = 500;
        this.hit = false;
        this.target;
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

    detectTarget(radius) { // used to see if the target is in range
        let a = this.globalX-this.target.globalX;
        let b = this.globalY-this.target.globalY;
        let distance = Math.hypot(a, b);
        if (distance < radius) { // if the entity's distance from a resource is less than the avoidDistance length
            return true;
        } else {
            return false;
        }
    }

    searchTargets(serverState) { // used for aggressive entities
        let shortestDistance;
        let closestTarget;
        for (let [clientID, user] of Object.entries(serverState.users.user)) {
            let a = this.globalX-user.globalX;
            let b = this.globalY-user.globalY;
            let distance = Math.hypot(a, b);
            if (distance < this.aggroDistance) {
                if (!shortestDistance && !closestTarget) { // if a closestTarget doesn't exist, add this one
                    shortestDistance = distance;
                    closestTarget = user;
                } else if (distance < shortestDistance) { // if a closestTarget does exist, and is closer than the current shortest distance, make new user new closest target
                    shortestDistance = distance;
                    closestTarget = user;
                }
            }
        }
        return closestTarget;
    }

    avoidArea(serverStateAreas) {
        for (let [areaID, area] of Object.entries(serverStateAreas)) {
            let entityInsideArea = area.objectInsideArea(this); // keep out external entities
            // if the entity is inside the area, the area is not the entities home area, and the entity has not been hit, then turn it away from area
            if (entityInsideArea && this.homeAreaID === 'map' && !this.hit) {
                let angle = (Math.round((Math.atan2(
                    this.globalY - area.globalY,
                    this.globalX - area.globalX
                )) * 180 / Math.PI) - this.angle + 90);
                if (angle >= 180) {
                    angle -= 360;
                } else if (angle <= -180) {
                    angle += 360;
                }
                this.rotate(angle/2, 3);
                break;
            } else if (!entityInsideArea && this.homeAreaID === areaID && !this.hit) {
                // if the entity is outsude the area and the area is the entities home area, and the entity has not been hit, then turn it owards the area
                // perhaps create hard limit on how far an entity can leave its area even if it has been hit
                let angle = (Math.round((Math.atan2(
                    this.globalY - area.globalY,
                    this.globalX - area.globalX
                )) * 180 / Math.PI) - this.angle - 90);
                if (angle >= 180) {
                    angle -= 360;
                } else if (angle <= -180) {
                    angle += 360;
                }
                this.rotate(angle/2, 3);
                break;
            }
        }
    }

    objectInsideEntity(object) {
        if (object.globalX >= -this.size[0] + this.globalX && object.globalX <= this.size[0] + this.globalX &&
            object.globalY >= -this.size[1] + this.globalY && object.globalY <= this.size[1] + this.globalY) {
            return true;
        }
    }
    
    avoidObjects(serverState, io) {
        let objects = {...serverState.resources.resource, ...serverState.structures.structure};
        for (let object of Object.values(objects)) {
            collisions.entityObjectCollisionHandle(this, object, io);
        }

        for (let object of Object.values(objects)) {
            const a = this.globalX - object.globalX;
            const b = this.globalY - object.globalY;
            let distance = Math.hypot(a, b);

            let collisionDistance = this.size[0]/2 + this.avoidPaddingDistance + (object.size[0]/2+object.size[1]/2)/2;
            
            if (distance < collisionDistance) {
                this.objectCollision = true;
                let angle = (Math.round((Math.atan2(
                    this.globalY - object.globalY,
                    this.globalX - object.globalX
                )) * 180 / Math.PI) - this.angle + 90);
                if (angle >= 180) {
                    angle -= 360;
                } else if (angle <= -180) {
                    angle += 360;
                }
                this.rotate(angle/15);
                break;
            } else {
                this.objectCollision = false;
            }
        }
    }

    rotate(stopAngle=0, thenWalk=false, override=true) {
        let speed = this.hit ? this.angeredSpeed : this.speed;
        if (stopAngle !== 'updateCall') { // if it isn't an update call
            if ((this.rotateFinish || override) && (stopAngle > speed || stopAngle < -speed)) { // if it completed, overriden, or significant
                this.thenWalk = thenWalk;
    
                this.stopAngle = stopAngle;
                this.rotateAngle = 0;
                this.initAngle = this.angle;
                this.rotateFinish = false;
            }
        } else {
            if (this.stopAngle < 0) { // turn left
                if (this.rotateAngle >= this.stopAngle) {
                    this.angle -= speed;
                    this.rotateAngle -= speed;
                    this.rotateFinish = false; // <--, may be un needed
                } else {
                    this.rotateFinish = true;
                }
            } else if (this.stopAngle >= 0) {
                if (this.rotateAngle <= this.stopAngle) {
                    this.angle += speed;
                    this.rotateAngle += speed;
                    this.rotateFinish = false; // <--, may be un needed
                } else {
                    this.rotateFinish = true;
                }
            }
        }

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
                this.globalX += Math.sin(this.angle * (Math.PI/180)) * speed;
                this.globalY += -Math.cos(this.angle * (Math.PI/180)) * speed;
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
        this.health -= damage;
        this.target = player;
        this.hit = true;
    }

    flee() {
        // rotate
        let a = Math.round((Math.atan2(
            this.globalY - this.target.globalY,
            this.globalX - this.target.globalX
        )) * 180 / Math.PI) - this.angle + 90;
        if (a >= 180) {
            a -= 360;
        } else if (a <= -180) {
            a += 360;
        }
        if (!this.objectCollision) {
            this.rotate(a);
        }
        // walk whilst rotating
        this.walk(3);
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
            this.globalY - this.target.globalY,
            this.globalX - this.target.globalX
        )) * 180 / Math.PI) - this.angle - 90;
        if (a >= 180) {
            a -= 360;
        } else if (a <= -180) {
            a += 360;
        }
        if (!this.objectCollision) {
            this.rotate(a);
        }
        // walk towards target, whilst rotating
        this.walk(3);
        // if target outside of aggro distance and target exists, then untarget it and reset attack tick to attack speed to ready for next attack
        if (!this.detectTarget(this.aggroDistance)) {
            this.target = undefined;
            this.hit = false;
            this.attackTick = this.attackSpeed;
        } else {
            // tick the attack ticker
            this.attackTick++;

            // if target is within attacking range, then attack
            this.attackTargetRadius = this.target.size[0]/2 + this.size[0]/2;
            if (this.detectTarget(this.attackTargetRadius + 7)) { // 7 is an extra padding space
                if (this.attackTick >= this.attackSpeed) {
                    this.target.attacked(this.damage);
                    if (this.type === 'beetle') { // maybe move to userState.attacked()?
                        this.target.effects['poisoned'] = { tick: 0 };
                    }
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
        if (this.neutrality === "passive" || this.neutrality === "neutral" || this.neutrality === "aggressive") {
            this.decideAction();
        }
    }

    boundaryContain(boundarySize) {
        // rotate
        let a = Math.round((Math.atan2(
            this.globalY,
            this.globalX,
        )) * 180 / Math.PI) - this.angle - 90;
        if (a >= 180) {
            a -= 360;
        } else if (a <= -180) {
            a += 360;
        }

        if (this.globalX <= -boundarySize[0]/2 || this.globalX >= boundarySize[0]/2 ||
            this.globalY <= -boundarySize[1]/2 || this.globalY >= boundarySize[1]/2) {
            this.rotate(a, 15);
        }

        // if the entity has somehow gotten to a place way beyond the boundary, reset its position
        if (this.globalX <= -boundarySize[0]/2 - boundarySize[0]/3 || this.globalX >= boundarySize[0]/2 + boundarySize[0]/3 ||
            this.globalY <= -boundarySize[1]/2 - boundarySize[1]/3 || this.globalY >= boundarySize[1]/2 + boundarySize[1]/3) {
            this.globalX = 0;
            this.globalY = 0;
        }
    }

    displaceIfInsideObject(serverState, minX, minY, maxX, maxY) {
        // if an entity spawns inside of a structure or resource, move it outside of it
        const objects = {...serverState.resources.resource, ...serverState.structures.structure} // combine resource and structure objects
        for (let [objectID, object] of Object.entries(objects)) {
            let maxDisplacementRuns = 100;
            for (let i = 0; i < maxDisplacementRuns; i++) { // try 100 times to displace
                if (this.objectInsideEntity(object)) {
                    // determines if the direction is -1 or +1, adds one to make the direction a true or false value, and then evaluate a ternary operator to see where to
                    // displace the entity towards. Try to move it closer to the center of the map
                    let directionX = Math.sign(this.globalX) + 1;
                    this.globalX += directionX ? -object.size[0] : object.size[0];
                    let directionY = Math.sign(this.globalY) + 1;
                    this.globalY += directionY ? -object.size[1] : object.size[1];
                    if (i % 3 === 0) { // if still displaced, then 
                        this.globalX = randomInt(minX, maxX);
                        this.globalY = randomInt(minY, maxY);
                    }
                    if (i === maxDisplacementRuns-1) { // if still displaced, just delete the resource
                        /*f (objectID[0] === 's') { // tests if it is a structure
                            delete serverState.structures[objectID]; // if it is, delete from server state structures
                        } else if (objectID[0] === 'r') { // tests if it is a resource
                            delete serverState.resources[objectID]; // if it is, delete from server state resources
                        }*/
                        this.globalX = randomInt(minX, maxX);
                        this.globalY = randomInt(minY, maxY);
                        break;
                    }
                } else {
                    break;
                }
            }
        }
    }

    update(serverState, io) {
        this.collisionvx = 0;
        this.collisionvy = 0;
        this.objectCollision = false;
        this.tick();

        this.globalX = this.globalX;
        this.globalY = this.globalY;
            
        if (this.angle >= 360) { // prevents angle from going to values greater or less than 360 or -360
            this.angle -= 360;
        } else if (this.angle <= -360) {
            this.angle += 360;
        }
        
        if (this.neutrality === "passive" || this.neutrality === "neutral") {
            if (this.hit) {
                if (this.neutrality === "passive") {
                    this.flee();
                } else if (this.neutrality === "neutral") {
                    this.attack();
                }
            } else if (this.actionTicker >= this.actionTimer) {
                this.move();
                this.actionTimer = Math.floor(Math.random() * (300 - 100 + 1) + 100); // gen random number betwee 100 and 800
                this.actionTicker = 0;
            }
        } else if (this.neutrality === "aggressive") {
            this.target = this.searchTargets(serverState);
            if (this.target) {
                // chase after target as if it was hit/enraged
                this.attack();
                this.hit = true;
            } else if (this.actionTicker >= this.actionTimer) { // no target - proceed as normal
                this.hit = false;
                this.move();
                this.actionTimer = Math.floor(Math.random() * (300 - 100 + 1) + 100); // gen random number betwee 100 and 800
                this.actionTicker = 0;
            }
        }
        
        this.avoidObjects(serverState, io);
        this.avoidArea(serverState.areas.area);
        this.boundaryContain(serverState.size);

        
        this.walk('updateCall');
        this.rotate('updateCall');

        this.globalX -= this.collisionvx;
        this.globalY -= this.collisionvy;

        if (this.killed()) {
            delete serverState.entities.entityData[this.entityID];
            delete serverState.entities.entity[this.entityID];
        } else {
            // update the data that the server sends to clients
            serverState.entities.entityData[this.entityID] = this.entityDataPackage();
        }
    }

    killed() {
        return this.health <= 0; // move to entity AI
    }

    entityDataPackage() {
        return {
            entityID: this.entityID,
            type: this.type,
            globalX: this.globalX,
            globalY: this.globalY,
            angle: this.angle,
        }
    }
}
