module.exports = class UserState {
    constructor(clientID, globalX, globalY, angle) {
        this.clientID = clientID;
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.angle = angle || 0; // may cause issues with player being temporarily rendered in incorrect places
    }
    updateClientInfo(globalX, globalY, angle) {
        this.globalX = globalX;
        this.globalY = globalY;
        this.angle = angle;
    }
}