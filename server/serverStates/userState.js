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
        this.hunger = 70;
        this.dead = false;
        this.attackFlash = false;

        this.radius = (100 * 0.865)/2;

        this.inventory = {};

        // hunger variables
        this.hungerTick = 0;
        this.hungerSpeed = 100;
    }

    attacked(damage) {
        this.health -= damage;
        this.attackFlash = true;
        this.socket.emit('healthUpdate', {
            damage: damage,
        });
    }

    harvest(type, amount) {
        let itemInventoryName;
        switch(type) {
            case 'tree':
                itemInventoryName = 'wood';
                break;
            case 'rock':
                itemInventoryName = 'stone';
                break;
        }

        if (!this.inventory[itemInventoryName]) {
            this.inventory[itemInventoryName] = 0;
        }
        this.inventory[itemInventoryName] += amount;
        
        // increase player score
        this.score += amount;
    }
    kill(lootDrops) { // later maybe combine kill and harvest
        const lootDropKeys = Object.keys(lootDrops);
        for (let i = 0; i < lootDropKeys.length; i ++) {
            if (!this.inventory[lootDropKeys[i]]) this.inventory[lootDropKeys[i]] = 0;
            this.inventory[lootDropKeys[i]] += lootDrops[lootDropKeys[i]];

            // increase player score
            this.score += lootDrops[lootDropKeys[i]];
        }
        // increase player score for killing the animal
        this.score += 3;
    }
    hungerTicker() {
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