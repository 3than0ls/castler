const imageSize = require('image-size');
const items = require('./../items/items.js');

module.exports = class CrateState {
    constructor(globalX, globalY, contents, crateID) {
        this.crateID = crateID || 'c' + Math.random().toString(36).substr(2, 9);
        this.globalX = globalX || 0;
        this.globalY = globalY || 0;
        this.contents = contents || {};
        // this.size = [imageSize(`./public/assets/resources/${type}.png`).width, imageSize(`./public/assets/resources/${type}.png`).height];

        this.disappearTime = 10000;
    }
    update(serverState) {
        this.disappearTime --;
        if (this.disappearTime <= 0) {
            delete serverState.crates[this.crateID];
        }
    }
    loot(player) {
        for (let [itemName, item] of Object.entries(this.contents)) {
            if (!player.inventory[itemName] && items[itemName]) { // if item does not exist, create it in player inventory
                player.inventory[itemName] = {
                    consumable: items[itemName].consumable,
                    amount: 0,
                }
            }
            player.inventory[itemName].amount += item.amount;
        }
        this.disappearTime = 0;
    }
}