module.exports = class UserState {
    constructor(clientID, globalX, globalY, angle) {
        this.clientID = clientID;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.angle = angle || 0;
        this.swingAngle = 0;
        this.displayHand = 'hand';

        this.inventory = {
            'wood': 10,
            'stone': 0,
            'meat': 0,
        }
    }
    harvest(type, amount) {
        switch(type) {
            case 'tree':
                this.inventory['wood'] += amount;
                break;
            case 'rock':
                this.inventory['stone'] += amount;
                break;
        }
    }
    kill(lootDrops) { // later maybe combine kill and harvest
        const lootDropKeys = Object.keys(lootDrops);
        for (let i = 0; i < lootDropKeys.length; i ++) {
            if (!this.inventory[lootDropKeys[i]]) this.inventory[lootDropKeys[i]] = 0;
            this.inventory[lootDropKeys[i]] += lootDrops[lootDropKeys[i]];
        }
    }
    updateClientInfo(globalX, globalY, angle, swingAngle, displayHand) {
        this.globalX = globalX;
        this.globalY = globalY;
        this.angle = angle;
        this.swingAngle = swingAngle;
        this.displayHand = displayHand;
    }
}