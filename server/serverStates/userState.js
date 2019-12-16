module.exports = class UserState {
    constructor(socket, globalX, globalY, angle) {
        this.socket = socket;
        this.clientID = socket.id;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.angle = angle || 0;
        this.swingAngle = 0;
        this.displayHand = 'hand';

        this.health = 100;
        this.attackFlash = false;

        this.radius = (100 * 0.865)/2;

        this.inventory = {}
    }

    attacked(damage) {
        this.health -= damage;
        this.attackFlash = true;
        this.socket.emit('healthUpdate', {
            damage: damage,
        });
        if (this.health <= 0) {
            this.socket.emit('clientDied');
        }
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
    }
    kill(lootDrops) { // later maybe combine kill and harvest
        const lootDropKeys = Object.keys(lootDrops);
        for (let i = 0; i < lootDropKeys.length; i ++) {
            if (!this.inventory[lootDropKeys[i]]) this.inventory[lootDropKeys[i]] = 0;
            this.inventory[lootDropKeys[i]] += lootDrops[lootDropKeys[i]];
        }
    }
    updateClientInfo(globalX, globalY, angle, swingAngle, displayHand) {
        // update variables from client
        this.globalX = globalX;
        this.globalY = globalY;
        this.angle = angle;
        this.swingAngle = swingAngle;
        this.displayHand = displayHand;
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
        }
    }
}