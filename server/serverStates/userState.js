const gameItems = require('./../items/items.js');
const collisions = require('./../collisions.js');

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

        this.nickname = 'default'
        this.score = 0;

        this.health = 10;
        this.hunger = 100;
        this.dead = false;
        this.attackFlash = false;

        // player stats
        this.damage = 25;
        this.speed = 4;
        this.maxSpeed = 4

        this.radius = (100 * 0.865)/2;

        this.inventory = {
            cookedMeat: {
                consumable: true,
                amount: 20,
            },
            workbench: {
                consumable: true,
                amount: 1,
            }
        };
        this.toolTier = 'wood';
        this.harvestSpeed = 2;
        this.attackSpeed = 2;

        // hunger and regen tick and timer variables
        this.hungerTick = 0;
        this.hungerSpeed = 800;
        this.healTick = 0;
        this.healSpeed = 100;

        // crafting variables
        this.crafting = false;
        this.craftingTick = 0;
        this.craftingComplete = 1; // 1 for 100% or complete
    }

    update(serverState, map) {
        this.playerTick();
        // position updates
        // perhaps combine this and player tick, and or remove the current player tick from client update state and move it to where this update function is called
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

        let objects = {...serverState.resources, ...serverState.entities.entityAI, ...serverState.structures};
        for (let object of Object.values(objects)) {
            collisions.playerObjectCollisionHandle(this, object);
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
    }

    updateClientInfo(vx, vy, angle, swingAngle, displayHand, structureHand, focused) {
        // update variables sent from client, which are used to calculate other properties the player has
        // for example, vx, vy, collisionvx, collisionvy are set here, but aren't calculated in the addition of global locations until the server ticks the player
        // vx and vy are directions, telling to go left/up if negative or right/down if positive
        this.focused = focused;
        this.vx = vx;
        this.vy = vy;
        this.structureHand = structureHand;
        this.angle = angle;
        this.swingAngle = swingAngle;
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

            toolTier: this.toolTier,

            nickname: this.nickname,
            score: this.score,
        }
    }
}