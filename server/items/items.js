class Item {
    constructor(name, primary, consumable, consumeFunction, craftingTime, recipes, consumedOnCraft) {
        this.name = name;
        this.consumable = consumable || false;
        this.consumeFunction = consumeFunction || function(user) {};
        this.craftingTime = craftingTime || 1000;
        this.consumedOnCraft = consumedOnCraft || false;
        this.primary = primary; // primary items are acquired, not crafted, and thus don't have a recipe
        if (!this.primary) {
            this.recipes = recipes; // should be a list of recipes that can be used to make this item
        }
    }
    craft(player) {
        let canCraftRecipe = this.canCraft(player.inventory); // canCraftRecipe will return the crafting recipe used if true
        if (canCraftRecipe) {
            for (let recipeItem in canCraftRecipe) {
                player.inventory[recipeItem].amount -= canCraftRecipe[recipeItem];
                if (player.inventory[recipeItem].amount === 0) {
                    delete player.inventory[recipeItem];
                }
            }

            if (!this.consumedOnCraft) {
                if (!player.inventory[this.name]) { // if item doesn't exist in inventory, create it
                    player.inventory[this.name] = {
                        consumable: this.consumable,
                        amount: 0,
                    };
                }
                player.inventory[this.name].amount += 1;
            } else {
                // if consumed on craft is true, automatically consume item
                this.consumeFunction(player);
            }
        }
    }
    canCraft(inventory) {
        if (!this.primary) {
            recipeNumber: for (let i = 0; i < this.recipes.length; i++) { // loop through each different recipe of an item
                // console.log(`\nIterating over recipe number ${i}: ${JSON.stringify(this.recipes[i])}`);
                let hasItems = []; // create a has item array
                for (let recipeItem in this.recipes[i]) { // for each recipe item in a recipe
                    if (!inventory[recipeItem]) {
                        // console.log(`The inventory does not have the items neccesary to craft ${this.name} using the ${JSON.stringify(this.recipes[i])} recipe`);
                        // console.log(`Item needed: ${recipeItem}. Continuing to next recipe`)
                        continue recipeNumber; // a recipe item is missing, skip to next possible recipe (if there are none left, exits loop)
                    } else {
                        if (inventory[recipeItem].amount >= this.recipes[i][recipeItem]) { // if the inventory has more than or equal to the amount required
                            // console.log(`The inventory has enough ${recipeItem} (${inventory[recipeItem]}) to make ${this.name} (amount needed: ${this.recipes[i][recipeItem]})`);
                            hasItems.push(true);
                        } else {
                            // console.log(`The inventory doesn't have enough ${recipeItem} (${inventory[recipeItem]}) to make ${this.name} (amount needed: ${this.recipes[i][recipeItem]})`);
                            // console.log(`Not enough of ${recipeItem} in inventory. Amount required: ${this.recipes[i][recipeItem]}. Continuing to next recipe`)
                            continue recipeNumber; // there is not enough of a recipe item in the inventory to craft item, skip to next possible recipe
                        }
                    }
                }
                let canCraft = hasItems.every((val) => val === true); // tests if hasItems index values are all true
                if (canCraft) return this.recipes[i]; // returns the crafting recipe
            }
            return false; // if loop exited and cannot recipe parts not found, return false   
        } else {
            // item is a primary, and cannot be crafted
            // console.log('You attempted to craft a primary uncraftable item');
            return false;
        }
    }
    test() {
        let canCraft = this.canCraft({
            wood: 10,
            stone: 10,
        });
        console.log(canCraft);
    }
}

function consumed(user, itemName) {
    user.inventory[itemName].amount -= 1;
    if (user.inventory[itemName].amount <= 0) {
        delete user.inventory[itemName];
    }
};

// make the only parameter for Item a config

module.exports = {
    stone: new Item('stone', true),
    wood: new Item('wood', true),
    ironChunk: new Item('ironChunk', true),
    rawMeat: new Item('rawMeat', true),
    feather: new Item('feather', true),
    fur: new Item('fur', true),

    stoneTools: new Item('stoneTools', false, true, (user) => {
        user.toolTier = 'stone';
        user.damage = 50;
        user.attackSpeed = 2.5;
        user.harvestSpeed = 2.5;
    }, 2500, [
        {
            stone: 1,
        }
    ], true),

    ironTools: new Item('ironTools', false, true, (user) => {
        user.toolTier = 'iron';
        user.damage = 70;
        user.attackSpeed = 3;
        user.harvestSpeed = 3;
    }, 2500, [
        {
            ironPiece: 1,
        }
    ], true),

    ironPiece: new Item('ironPiece', false, false, false, 2000, [
        {
            ironChunk: 5,
        }
    ]),

    cookedMeat: new Item('cookedMeat', false, true, (user) => {
        if (user.hunger < 100) {
            consumed(user, 'cookedMeat');
            user.hunger += 25;
        }
    }, 2000, [
        {
            rawMeat: 1,
        }
    ]),

    foodRation: new Item('foodRation', true, true, (user) => {
        if (user.hunger < 100) {
            consumed(user, 'foodRation');
            user.hunger += 25;
        }
    })
}