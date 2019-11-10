module.exports = class UserState {
    constructor(clientID, globalX, globalY, angle) {
        this.clientID = clientID;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.angle = angle || 0;
        this.displayHand = 'hand';
    }
    updateClientInfo(globalX, globalY, angle, displayHand) {
        this.globalX = globalX;
        this.globalY = globalY;
        this.angle = angle;
        this.displayHand = displayHand;
    }
}