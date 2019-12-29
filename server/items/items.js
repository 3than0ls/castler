class Item {
    constructor(name, primary, recipes) {
        this.name = name;
        this.primary = primary; // primary items are acquired, not crafted, and thus don't have a recipe
        if (!this.primary) {
            this.recipes = recipes; // should be a list of recipes that can be used to make this item
        }
    }
    craft(inventory) {
        let canCraftRecipe = this.canCraft(inventory); // canCraftRecipe will return the crafting recipe used if true
        if (canCraftRecipe) {
            for (let recipeItem in canCraftRecipe) {
                inventory[recipeItem.name] -= canCraftRecipe[recipeItem];
            }

            if (!inventory[this.name]) { // if item doesn't exist in inventory, create it
                inventory[this.name] = 0;
            }
            inventory[this.name] += 1;
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
                        if (inventory[recipeItem] >= this.recipes[i][recipeItem]) { // if the inventory has more than or equal to the amount required
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

module.exports = {
    stone: new Item('stone', true),
    wood: new Item('stone', true),
    meat: new Item('meat', true),
    feather: new Item('feather', true),
    fur: new Item('fur', true),

    test: new Item('test', false, [
        {
            'stone': 20,
        },
        {
            'wood': 20,
        },
        {
            'stone': 10,
            'wood': 10,
        },
    ])
}