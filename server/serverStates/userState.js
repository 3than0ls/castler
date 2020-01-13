const gameItems = require('./../items/items.js');

module.exports = class UserState {
    constructor(socket, globalX, globalY, angle) {
        this.socket = socket;
        this.clientID = socket.id;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.angle = angle || 0;
        this.swingAngle = 0;
        this.displayHand = 'hand';

        this.nickname = 'default'
        this.score = 0;

        this.health = 10;
        this.hunger = 100;
        this.dead = false;
        this.attackFlash = false;

        this.radius = (100 * 0.865)/2;

        this.inventory = {
            cookedMeat: {
                consumable: true,
                amount: 2,
            }
        };

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
        this.attackFlash = false;
        this.hungerTick++;
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
                    item.craft(this.inventory);
                    clearInterval(intervalID);
                }
            }, 1);
        }
    }
    updateClientInfo(globalX, globalY, angle, swingAngle, displayHand) {
        // update variables from client
        this.globalX = globalX;
        this.globalY = globalY;
        this.angle = angle;
        this.swingAngle = swingAngle;
        this.displayHand = displayHand;

        if (this.health <= 0) {
            this.dead = true;
        }
    }
    clientDataPackage() {
        return {
            clientID: this.clientID,
            globalX: this.globalX,
            globalY: this.globalY,
            angle: this.angle,
            swingAngle: this.swingAngle,
            displayHand: this.displayHand,
            attackFlash: this.attackFlash,

            nickname: this.nickname,
            score: this.score,
        }
    }
}