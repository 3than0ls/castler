const gameItems = require('./../gameConfigs/items.js');
const collisions = require('./../collisions.js');
const createMap = require('./../createMap.js');
const imageSize = require('image-size');
const effects = require('./../gameConfigs/effects.js')

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

        this.effects = {};

        this.inventory = {
            cookedMeat: {
                consumable: true,
                amount: 100,
            },
            ironBars: {
                amount: 50,
            },
            fur: {
                amount: 50,
            },
            stone: {
                amount: 500,
            },
            mandibles: {
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
            devArmor: {
                amount: 1,
                consumable: true,
            },
        };
        this.toolTier = 'wood';
        this.armorTier = 'fur';
        this.toolTierUnlocked = 0;
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

    effectPlayerInsideArea(area) {
        if (area.objectInsideArea(this)) {
            switch (area.type) {
                case 'mine': 
                    delete this.effects['swimming'];
                    break;
                case 'lake':
                    this.effects['swimming'] = {
                        tick: 0,
                    }
                    break;
            }
        }
    }

    effectPlayerNearStructure(structure) {
        if (structure.objectWithinRange(this)) {
            switch (structure.type) {
                case 'workbench':
                    break;
                case 'furnace':
                    if (!this.effects['warmed']) {
                        this.effects['warmed'] = {
                            tick: 0,
                        }
                    }
                    break;
                    
            }
        }
    }

    effectsUpdate() {
        for (let [effectName, effectData] of Object.entries(this.effects)) {
            if (effects[effectName].effectOverTime) {
                if (effectData.tick % effects[effectName].effectSpeed === 0 && effectData.tick !== 0) {
                    effects[effectName].effect(this)
                }
            } else {
                effects[effectName].effect(this);
            }

            if (effectData.tick >= effects[effectName].expires) {
                delete this.effects[effectName];
            }

            if (this.effects[effectName]) {
                this.effects[effectName].tick ++;
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
        switch (this.toolTier) {
            case 'wood':
                this.damage = 25;
                this.harvestSpeed = 2;
                this.attackSpeed = 2;
                break;
            case 'stone':
                this.damage = 35;
                this.harvestSpeed = 2.3;
                this.attackSpeed = 2.3;
                break;
            case 'iron':
                this.damage = 55;
                this.harvestSpeed = 2.8;
                this.attackSpeed = 2.8;
                break;
            case 'mandible':
                this.damage = 55;
                this.harvestSpeed = 3.1;
                this.attackSpeed = 2.9;
                break;
            case 'ruby':
                this.damage = 35;
                this.harvestSpeed = 5;
                this.attackSpeed = 5;
                break;
        }

        switch (this.armorTier) {
            case 'iron':
                this.armorDamageReduction = 0.4;
                break;
            case 'fur':
                this.armorDamageReduction = 0.2;
                break;
            case 'dev':
                this.armorDamageReduction = 1;
                break;
            default: 
                this.armorDamageReduction = 0;
        }

        // position updates
        // perhaps combine this and player tick, and or remove the current player tick from client update state and move it to where this update function is called
        // update attributes dependent on location relative to areas and structures
        for (let area of Object.values(serverState.areas.area).sort((a,b) => (a.zIndex > b.zIndex) ? 1 : ((b.zIndex > a.zIndex) ? -1 : 0))) { // apply effects based on area z index
            this.effectPlayerInsideArea(area);
        }
        for (let structure of Object.values(serverState.structures.structure)) {
            this.effectPlayerNearStructure(structure);
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

        let objects = {...serverState.resources.resource, ...serverState.entities.entity, ...serverState.structures.structure, ...serverState.users.user};
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
                for (let resource of Object.values(serverState.resources.resource)) {
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
                for (let structure of Object.values(serverState.structures.structure)) {
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
                            io.emit('destroyed', {
                                collisionX: this.collisionPoints[this.displayHandType].x,
                                collisionY: this.collisionPoints[this.displayHandType].y,
                                structureID: structure.structureID,
                            });
                            structure.destroyed(createMap, serverState);
                            delete serverState.structures.structure[structure.structureID];
                            delete serverState.structures.structureData[structure.structureID];
                        }
                    }
                }
            } else if (this.displayHandType === "sword") {
                for (let entity of Object.values(serverState.entities.entity)) {
                    if (collisions.collisionPointObject(this.collisionPoints[this.displayHandType], entity) && !this.alreadySwungAt.includes(entity.entityID)) {
                        // subtract the amount of health that the entity took
                        entity.attacked(this.damage, this);

                        /* if the entity was killed */
                        if (entity.killed()) {
                            // add the amount harvested from kill to client inventory
                            this.kill(entity.loot);
                            io.emit('killed', {
                                collisionX: this.collisionPoints[this.displayHandType].x,
                                collisionY: this.collisionPoints[this.displayHandType].y,
                                entityID: entity.entityID,
                            });
                            if (entity.homeAreaID && entity.homeAreaID !== 'map') { // if entity had a home area and it isn't the map, decrease areas entity amount
                                serverState.areas.area[entity.homeAreaID].entityCount--;
                            }

                            delete serverState.entities.entity[entity.entityID];
                            delete serverState.entities.entityData[entity.entityID];
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
                        user.attacked(this.damage)
                        if (this.toolTier === 'mandible') {
                            user.effects['poisoned'] = { tick: 0 }
                        }
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
        this.health -= damage - (damage * this.armorDamageReduction);
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
            case 'ruby':
                gameItemName = gameItems['rubies'].name;
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
            if (this.inventory[type] && gameItems[type]) {
                this.inventory[type].amount -= amount;
                
                createMap.createCrate(serverState, 
                    { 
                        [type]: {
                            amount: amount,
                            consumable: gameItems[type].consumable,
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
        for (let crate of Object.values(serverState.crates.crate)) {
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
                // this.attacked(5);
                this.health -= 15;
                this.attackFlash = true;
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
        // determines what items are craftable with the current inventory. The progression is wood -> stone -> iron -> anything else REMOVED, NEEDS TO BE RE ADDED
        const itemFilteredTools = [];
        for (let item of Object.values(items)) {
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
                let correctCraftingStructure = Object.values(serverState.structures.structure).filter(structure => craftingStructure === structure.type);
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
                consumable: gameItems[itemName].consumable,
            }
        }
        createMap.createCrate(serverState, inventory, 1, this.globalX - this.size[0]/3, this.globalY - this.size[1]/3, this.globalX + this.size[0]/3, this.globalY + this.size[1]/3);
        createMap.createCrate(serverState, { 
                [this.toolTier.concat('Tools')]: { amount: 1, consumable: true },
                [this.armorTier.concat('Armor')]: { amount: 1, consumable: true },
        }, 1, this.globalX - this.size[0]/3, this.globalY - this.size[1]/3, this.globalX + this.size[0]/3, this.globalY + this.size[1]/3);
    }

    clientDataPackage() {
        let flash = false;
        if (this.attackFlash) {
            flash = true;
            this.attackFlash = false;
            console.log('flash')
        }
        return {
            clientID: this.clientID,
            globalX: this.globalX,
            globalY: this.globalY,
            angle: this.angle,
            swingAngle: this.swingAngle,
            displayHand: this.displayHand,
            attackFlash: flash,
            effects: this.effects,

            toolTier: this.toolTier,
            armorTier: this.armorTier,

            nickname: this.nickname,
            score: this.score,
        }
    }
}