module.exports = function lootDrops(type) {
    let loot = {};
    switch (type) {
        case "duck":
            loot = {
                feather: 1,
                rawMeat: 1,
            }
            break;
        case "boar":
            loot = {
                fur: 1,
                rawMeat: 2,
            }
            break;
    }
    return loot;
}