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
    kill(type, amount) { // later maybe combine kill and harvest
        switch(type) {
            case 'duck':
                this.inventory['meat'] += amount;
                break;
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