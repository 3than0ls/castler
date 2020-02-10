const gameItems = require('./../items/items.js');
const collisions = require('./../collisions.js');
const createMap = require('./../createMap.js');
const items = require('./../items/items.js');
const imageSize = require('image-size');
const effects = require('./../items/effects.js')

module.exports = class UserState {
    constructor(socketID, globalX, globalY, angle) {
        this.clientID = socketID;

        this.globalX = globalX || 0;
        this.globalY = globalY || 0;

        // variablse to be updated in updateClientInfo
        this.vx = 0;
        this.vy = 0;
        this.collisionvx = 0;
        this.collisionvy = 0;
        this.focused = false;
        this.angle = angle || 0;
        this.swingAngle = 0;
        this.displayHand = 'hand';
        this.structureHand;
        this.openCrate = false;

        this.collisionPoints = {};

        this.cachedDisplayHand = this.displayHand;

        this.nickname = 'default'
        this.score = 0;

        this.health = 100;
        this.hunger = 50;
        this.dead = false;
        this.attackFlash = false;

        // player stats
        this.damage = 25;
        this.speed = 4;
        this.maxSpeed = 4

        this.size = [imageSize('./public/assets/player/playerBody.png').width * 0.865, imageSize('./public/assets/player/playerBody.png').height * 0.865];

        this.effects = {
            poisoned: {
                tick: 0,
            }
        };

        this.inventory = {
            cookedMeat: {
                consumable: true,
                amount: 1,
            },
            stone: {
                amount: 500,
            },
            wood: {
                amount: 500,
            },
            workbench: {
                amount: 500,
                consumable: true,
            },
            furnace: {
                amount: 500,
                consumable: true,
            },
            fur: {
                amount: 500,
            },
            feather: {
                amount: 500,
            }
        };
        this.toolTier = 'iron';
        this.harvestSpeed = 2;
        this.attackSpeed = 2;

        this.inWater = false;

        // hunger and regen tick and timer variables
        this.hungerTick = 0;
        this.hungerSpeed = 800;
        this.healTick = 0;
        this.healSpeed = 100;

        // crafting variables
        this.crafting = false;
        this.craftingTick = 0;
        this.craftingComplete = 1; // 1 for 100% or complete

        // swing animation variables
        this.swingRequest = false;
        this.swingAvailable = true;
        this.stopRotation = 40;
        this.swingBack = false;

        this.alreadySwungAt = [];
    }

    affectPlayerInsideArea(area) {
        if (area.objectInsideArea(this)) {
            switch (area.type) {
                case 'mine': 
                    break;
                case 'lake':
                    this.effects['swimming'] = {
                        tick: 0,
                    }
                    break;
            }
        }
    }

    affectPlayerNearStructure(structure) {
        if (structure.objectWithinRange(this)) {
            switch (structure.type) {
                case 'workbench':
                    break;
                case 'furnace':
                    this.effects['warmed'] = {
                        tick: 0,
                    }
                    break;
                    
            }
        }
    }

    effectsUpdate() {
        for (let [effectName, effectData] of Object.entries(this.effects)) {
            if (effects[effectName].effectOverTime) {
                if (effectData.tick % effects[effectName].effectSpeed === 0) {
                    effects[effectName].effect(this)
                }
            } else {
                effects[effectName].effect(this);
            }

            this.effects[effectName].tick ++;

            if (effectData.tick >= effects[effectName].expires) {
                delete this.effects[effectName];
            }
        }
    }

    update(serverState, map, io) {
        this.playerTick();
        this.updateCollisionPoints();
        // update if dead or not
        if (this.health <= 0) {
            this.dead = true;
        }
        // update tool tier
        if (this.toolTier === "wood") {
            this.damage = 25;
            this.harvestSpeed = 2;
            this.attackSpeed = 2;
        } else if (this.toolTier === "stone") {
            this.damage = 35;
            this.harvestSpeed = 2.3;
            this.attackSpeed = 2.3;
        } else if (this.toolTier === "iron") {
            this.damage = 55;
            this.harvestSpeed = 2.8;
            this.attackSpeed = 2.8;
        }
        // position updates
        // perhaps combine this and player tick, and or remove the current player tick from client update state and move it to where this update function is called
        // update attributes dependent on location relative to areas and structures
        for (let area of Object.values(serverState.areas)) {
            this.affectPlayerInsideArea(area);
        }
        for (let structure of Object.values(serverState.structures)) {
            this.affectPlayerNearStructure(structure);
        }
        this.effectsUpdate(); // update all effect ticks and handling
        if (this.vx !== 0 && this.vy !== 0) {
            this.globalX += this.vx * this.speed * Math.sin(45);
            this.globalY += this.vy * this.speed * Math.sin(45);
        } else {
            this.globalX += this.vx * this.speed;
            this.globalY += this.vy * this.speed;
        }
        if (this.health <= 0) {
            this.dead = true;
        }

        let objects = {...serverState.resources, ...serverState.entities.entityAI, ...serverState.structures, ...serverState.users.user};
        for (let object of Object.values(objects)) {
            if (object.hasOwnProperty('clientID') && object.clientID === this.clientID) {
                continue;
            }
            collisions.playerObjectCollisionHandle(this, object);
        }

        if (this.cachedDisplayHand !== this.displayHand) {
            this.swingAngle = 0;
            this.swingRequest = false;
            this.cachedDisplayHand = this.displayHand;
        }
        if (this.displayHand !== "hand" && (this.swingRequest || this.swingAngle > 0)) {
            this.swing(serverState, io);
        }

        // make the maximum collisionvx and collisionvy the player speed
        if (!isFinite(this.collisionvx)) {
            this.collisionvx = 1;
        }
        if (!isFinite(this.collisionvy)) {
            this.collisionvy = 1;
        }
        if (this.collisionvx > this.speed) {
            this.collisionvx = this.speed;
        } else if (this.collisionvx < -this.speed) {
            this.collisionvx = -this.speed;
        }

        this.boundaryContain(map.size);

        this.globalX += this.collisionvx;
        this.globalY += this.collisionvy;

        serverState.users.userData[this.clientID] = this.clientDataPackage(); // update data package
        
        this.collisionvx = 0;
        this.collisionvy = 0;
        this.swingRequest = false;
    }

    killUser(user) {
        this.score += Math.min(Math.ceil(user.score/4) + 5, 100);
        // perhaps some emitting of data to client
    }

    swing(serverState, io) {
        if (this.swingAvailable) {
            this.swingAngle = 0;
            this.stopRotation = 70;
            this.swingBack = false;
            
            this.swingAvailable = false;
        }
        
        if (!this.swingBack) { // if swinging forward,
            if (this.displayHandType === "axe") this.swingAngle += this.harvestSpeed;
            else if (this.displayHandType === "sword") this.swingAngle += this.attackSpeed;

            let amount = 1;
            // detect any collisions that may occur
            if (this.displayHandType === "axe") {
                for (let resource of Object.values(serverState.resources)) {
                    if (collisions.collisionPointObject(this.collisionPoints[this.displayHandType], resource) && !this.alreadySwungAt.includes(resource.resourceID)) {
                        // subtract the amount harvested from the resource
                        resource.harvest(amount);
                        // add the amount harvested to the clients resource pile
                        this.harvest(resource.type, amount);
                        this.alreadySwungAt.push(resource.resourceID);
                        // emit harvest event occuring
                        // create velocity and direction in which a resource bumps towards
                        let a = resource.globalX - this.globalX
                        let b = resource.globalY - this.globalY;
                        let vx = (Math.asin(a / Math.hypot(a, b))*10);
                        let vy = (Math.asin(b / Math.hypot(a, b))*10);
                        io.emit('harvested', { // harvested only provides a visual effect, and nothing else
                            vx: vx,
                            vy: vy,
                            collisionX: this.collisionPoints[this.displayHandType].x,
                            collisionY: this.collisionPoints[this.displayHandType].y,
                            resourceID: resource.resourceID,
                            harvestSpeed: this.harvestSpeed
                        });
                    };
                }
                for (let structure of Object.values(serverState.structures)) {
                    if (collisions.collisionPointObject(this.collisionPoints[this.displayHandType], structure) && !this.alreadySwungAt.includes(structure.structureID)) {
                        this.alreadySwungAt.push(structure.structureID);
                        let a = structure.globalX - this.globalX;
                        let b = structure.globalY - this.globalY;
                        let vx = (Math.asin(a / Math.hypot(a, b))*10);
                        let vy = (Math.asin(b / Math.hypot(a, b))*10);
                        io.emit('hit', {
                            vx: vx,
                            vy: vy,
                            collisionX: this.collisionPoints[this.displayHandType].x,
                            collisionY: this.collisionPoints[this.displayHandType].y,
                            structureID: structure.structureID,
                            harvestSpeed: this.harvestSpeed
                        });

                        structure.health -= this.damage;
                        if (structure.health <= 0) {
                            io.emit('destroyed', { // currently does nothing
                                collisionX: this.collisionPoints[this.displayHandType].x,
                                collisionY: this.collisionPoints[this.displayHandType].y,
                                structureID: structure.structureID,
                            });
                            structure.destroyed(createMap, serverState)
                            delete serverState.structures[structure.structureID];
                        }
                    }
                }
            } else if (this.displayHandType === "sword") {
                for (let entity of Object.values(serverState.entities.entityAI)) {
                    if (collisions.collisionPointObject(this.collisionPoints[this.displayHandType], entity) && !this.alreadySwungAt.includes(entity.entityID)) {
                        // subtract the amount of health that the entity took
                        entity.attacked(this.damage, this);

                        /* if the entity was killed */
                        if (entity.entityState.killed()) {
                            // add the amount harvested from kill to client inventory
                            this.kill(entity.entityState.loot);
                            io.emit('killed', {
                                collisionX: this.collisionPoints[this.displayHandType].x,
                                collisionY: this.collisionPoints[this.displayHandType].y,
                                entityID: entity.entityID,
                            });
                            if (entity.entityState.homeAreaID && entity.entityState.homeAreaID !== 'map') { // if entity had a home area and it isn't the map, decrease areas entity amount
                                serverState.areas[entity.entityState.homeAreaID].entityCount--;
                            }

                            delete serverState.entities.entityAI[entity.entityID];
                            delete serverState.entities.entityState[entity.entityID];
                        }
                        
                        // emit attack event occuring
                        io.emit('attacked', { // attacked only provides a visual effect, and nothing else
                            collisionX: this.collisionPoints[this.displayHandType].x,
                            collisionY: this.collisionPoints[this.displayHandType].y,
                            entityID: entity.entityID,
                        });

                        this.alreadySwungAt.push(entity.entityID);
                    };
                }
                for (let user of Object.values(serverState.users.user)) {
                    if (collisions.collisionPointObject(this.collisionPoints[this.displayHandType], user) && !this.alreadySwungAt.includes(user.clientID)) {
                        user.health -= this.damage;
                        user.attackFlash = true;
                        if (user.health <= 0 || user.dead) { // user.dead may not be necessary, and this may be buggy
                            this.killUser(user);
                        }
                        this.alreadySwungAt.push(user.clientID);
                    }
                }
            }
                
            
            
        } else {
            if (this.displayHandType === "axe") this.swingAngle -= this.harvestSpeed;
            else if (this.displayHandType === "sword") this.swingAngle -= this.attackSpeed;
        }

        
        if (!this.swingBack) {
        }
        if (this.swingAngle >= this.stopRotation) {
            this.swingBack = true;
        }
        
        if (this.swingAngle <= 0 && this.swingBack) { // end of animation - swingAvailable is true (another swing is available)
            this.swingAvailable = true;
            this.swingAngle = 0;
            this.alreadySwungAt = [];
        }
    }

    updateCollisionPoints() {
        this.cachedHandSpriteSizes = {};
        if (!this.cachedHandSpriteSizes['axe']) {
            this.cachedHandSpriteSizes['axe'] = [
                imageSize('./public/assets/player/woodAxeHand.png').width, imageSize('./public/assets/player/woodAxeHand.png').height
            ];
        }
        if (!this.cachedHandSpriteSizes['sword']) {
            this.cachedHandSpriteSizes['sword'] = [
                imageSize('./public/assets/player/woodSwordHand.png').width, imageSize('./public/assets/player/woodSwordHand.png').height
            ];
        }
        this.displayHandType = "";
        if (this.displayHand.toLowerCase().includes('axehand')) {
            this.displayHandType = "axe";
        } else if (this.displayHand.toLowerCase().includes('swordhand')) {
            this.displayHandType = "sword";
        } else {
            this.displayHandType = "hand";
            this.collisionPoints["hand"] = {
                x: 0, y: 0,
            }
            return;
        }

        if (this.displayHandType) {
            if (this.displayHandType === "axe") {
                this.collisionPoints[this.displayHandType] = {
                    x: this.globalX - (this.cachedHandSpriteSizes[this.displayHandType][0] + this.size[0])/2 
                    * -Math.sin(-this.angle - (-0.95 + this.swingAngle * (Math.PI/180))),
    
                    y: this.globalY - (this.cachedHandSpriteSizes[this.displayHandType][1] + this.size[1])/2 
                    * -Math.cos(-this.angle - (-0.95 + this.swingAngle * (Math.PI/180))),
                }
            } else if (this.displayHandType === "sword") {
                this.collisionPoints[this.displayHandType] = {
                    x: this.globalX - (this.cachedHandSpriteSizes[this.displayHandType][0] + this.size[0])/2 
                    * -Math.sin(-this.angle - (-0.95 + this.swingAngle * (Math.PI/180))),
    
                    y: this.globalY - (this.cachedHandSpriteSizes[this.displayHandType][1] + this.size[1])/2 
                    * -Math.cos(-this.angle - (-0.95 + this.swingAngle * (Math.PI/180))),
                }
            }
        }
    }

    updateClientInfo(vx, vy, angle, swingAngle, displayHand, structureHand, focused, openCrate) {
        // update variables sent from client, which are used to calculate other properties the player has
        // for example, vx, vy, collisionvx, collisionvy are set here, but aren't calculated in the addition of global locations until the server ticks the player
        // vx and vy are directions, telling to go left/up if negative or right/down if positive
        this.focused = focused;
        this.openCrate = openCrate;
        this.vx = vx;
        this.vy = vy;
        this.structureHand = structureHand;
        this.angle = angle;
        // this.swingAngle = swingAngle;
        this.displayHand = displayHand;
    }

    attacked(damage) {
        this.health -= damage;
        this.attackFlash = true;
    }
    heal(amount) {
        this.health += amount;
        // this.healFlash = true; maybe something similar to attack flash, but for healing
    }
    harvest(type, amount) {
        let gameItemName;
        switch(type) {
            case 'tree':
                gameItemName = gameItems['wood'].name;
                break;
            case 'rock':
                gameItemName = gameItems['stone'].name;
                break;
            case 'iron':
                gameItemName = gameItems['ironChunk'].name;
                break;
            default:
                gameItemName = gameItems['stone'].name;
        }

        if (!this.inventory[gameItemName]) {
            this.inventory[gameItemName] = {
                consumable: gameItems[gameItemName].consumable,
                amount: 0,
            };
        }
        this.inventory[gameItemName].amount += amount;
        
        // increase player score
        this.score += amount;
    }
    kill(lootDrops) { // later maybe combine kill and harvest
        const lootDropKeys = Object.keys(lootDrops);
        for (let i = 0; i < lootDropKeys.length; i ++) {
            if (!this.inventory[lootDropKeys[i]]) {
                this.inventory[lootDropKeys[i]] = {
                    consumable: gameItems[lootDropKeys[i]].consumable,
                    amount: 0,
                };
            }
            this.inventory[lootDropKeys[i]].amount += lootDrops[lootDropKeys[i]];
        }
        // increase player score for killing the animal
        this.score += 3;
    }
    drop(type, amount, serverState) {
        if (typeof amount === "number" && !Number.isNaN(amount)) { // test if the amount is a number and it is not NaN
            if (this.inventory[type] && items[type]) {
                this.inventory[type].amount -= amount;
                
                createMap.createCrate(serverState, 
                    { 
                        [type]: {
                            amount: amount,
                            consumable: items[type].consumable,
                    }
                }, 1, this.globalX - 50, this.globalY - 50, this.globalX + 50, this.globalY + 50);

                if (this.inventory[type].amount <= 0) {
                    delete this.inventory[type];
                }
            } else {
                console.log(`dropping ${amount} of an undefined ${type} item type`);
            }
        }
    }

    lootCrate(serverState, clientCrateID) {
        let targetCrate;
        let targetCrateDist;
        for (let crate of Object.values(serverState.crates)) {
            let dist = Math.hypot(this.globalX - crate.globalX, this.globalY - crate.globalY);
            if (dist < 100) {
                if (!targetCrate) {
                targetCrate = crate;
                    targetCrateDist = dist;
                } else {
                    if (dist < targetCrateDist) {
                        targetCrate = crate;
                        targetCrateDist = dist;
                    }
                }
            }
        }

        if (targetCrate && clientCrateID === targetCrate.crateID) {
            targetCrate.loot(this);
        }
    }

    playerTick() {
        this.hungerTick++;

        if (this.hunger <= 20) {
            // hungry, decrease speed
            this.speed = this.maxSpeed/2;
        } else {
            this.speed = this.maxSpeed;
        }

        if (this.hungerTick >= this.hungerSpeed) {
            if (this.hunger > 0) {
                this.hunger -= 5;
            } else if (this.hunger <= 0) {
                this.attacked(5);
                // take damage from starving
            }
            this.hungerTick = 0;
        }
        if (this.hunger >= 100) {
            this.hunger = 100; // cap hunger at 100 in case it goes over
        }

        if (this.health < 100) {
            this.healTick++;
            if (this.healTick >= this.healSpeed) {
                if (this.hunger >= 40) { // healing with food
                    this.hunger -= 5;
                    this.heal(5);
                }
                this.healTick = 0;
            }
        } else {
            this.health = 100; // cap health at 100 in case it goes over
        }
    }
    boundaryContain(boundarySize) {
        if (this.globalX <= -boundarySize[0]/2) {
            this.globalX = -boundarySize[0]/2;
        }
        if (this.globalX >= boundarySize[0]/2) {
            this.globalX = boundarySize[0]/2;
        }
        if (this.globalY <= -boundarySize[1]/2) {
            this.globalY = -boundarySize[1]/2;
        }
        if (this.globalY >= boundarySize[1]/2) {
            this.globalY = boundarySize[1]/2;
        }

        // if the player has somehow gotten to a place way beyond the boundary, reset its position
        if (this.globalX <= -boundarySize[0]/2 - boundarySize[0]/3 || this.globalX >= boundarySize[0]/2 + boundarySize[0]/3 ||
            this.globalY <= -boundarySize[1]/2 - boundarySize[1]/3 || this.globalY >= boundarySize[1]/2 + boundarySize[1]/3) {
            this.globalX = 0;
            this.globalY = 0;

            this.attacked(10); // and damage them for exploiting, just for good measures
        }
    }
    craft(item) { // craft an item after a given interval (for crafting cooldown)
        if (!this.crafting) {
            let intervalID = setInterval(() => {
                this.craftingTick++;
                this.crafting = true;
                this.craftingComplete = this.craftingTick / item.craftingTime;
                if (this.craftingTick >= item.craftingTime) {
                    this.crafting = false;
                    this.craftingTick = 0;
                    item.craft(this);
                    clearInterval(intervalID);
                }
            }, 1);
        }
    }

    craftableItems(items, serverState) {
        // craftable items sorting algorithm, first filters out tool tiers that are un-needed, then checks if the item has the require crafting structure nearby
        // determines what items are craftable with the current inventory
        const itemFilteredTools = [];
        for (let item of Object.values(items)) {
            // determine next craftable tier, and if they already have that tier or higher, don't add that to the next stage of filtering
            if (this.toolTier === 'wood' && item.name === 'ironTools') {
                continue;
            }
            if (this.toolTier === 'stone' && item.name === 'stoneTools') {
                continue;
            }
            if (this.toolTier === 'iron' && (item.name === 'ironTools' || item.name === 'stoneTools')) {
                continue;
            }

            if (item.canCraft(this.inventory)) {
                itemFilteredTools.push(item);
            }
        }
        // checks each craftableItem's crafting structure availability, and if one is not available, remove it from end craftable items (items)
        const itemFilteredStructures = [];
        for (let i = 0; i < itemFilteredTools.length; i++) {
            // filter all crafting structures to only get the ones that the item needs
            if (itemFilteredTools[i].craftingStructure) { // if the item has a crafting structure
                let craftingStructure = itemFilteredTools[i].craftingStructure;
                let correctCraftingStructure = Object.values(serverState.structures).filter(structure => craftingStructure === structure.type);
                /*
                    idea: rather than iterating through every correct crafting structures and testing if object is within range
                    iterate through all correct crafting structures and test object is within range of the closest one
                */
                for (let j = 0; j < correctCraftingStructure.length; j++) {
                    if (correctCraftingStructure[j].objectWithinRange(this) && itemFilteredTools[i]) {
                        itemFilteredStructures.push(itemFilteredTools[i].name);
                        break;
                    }
                }
            } else {
                itemFilteredStructures.push(itemFilteredTools[i].name);
            }
        }
        return itemFilteredStructures;
    }

    die(createMap, serverState) {
        let inventory = {};
        for (let [itemName, itemData] of Object.entries(this.inventory)) {
            inventory[itemName] = {
                amount: itemData.amount,
                consumable: items[itemName].consumable
            }
        }
        createMap.createCrate(serverState, inventory, 1, this.globalX - this.size[0]/3, this.globalY - this.size[1]/3, this.globalX + this.size[0]/3, this.globalY + this.size[1]/3);
        createMap.createCrate(serverState, { [this.toolTier.concat('Tools')]: { amount: 1, consumable: true } }, 1, this.globalX - this.size[0]/3, this.globalY - this.size[1]/3, this.globalX + this.size[0]/3, this.globalY + this.size[1]/3);
    }

    clientDataPackage() {
        let flash = false;
        if (this.attackFlash) {
            flash = true;
            this.attackFlash = false;
        }
        return {
            clientID: this.clientID,
            globalX: this.globalX,
            globalY: this.globalY,
            angle: this.angle,
            swingAngle: this.swingAngle,
            displayHand: this.displayHand,
            attackFlash: flash,
            effects: this.effect,

            toolTier: this.toolTier,

            nickname: this.nickname,
            score: this.score,
        }
    }
}