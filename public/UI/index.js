import React from 'react';

import { Inventory } from "./controlUI/inventory/inventory.js";
import { HealthBar } from './statusBar/healthBar/healthBar.js';
import { Leaderboard } from './leaderboard/leaderboard.js';
import { HungerBar } from './statusBar/hungerBar/hungerBar.js';
import { CraftingUI } from './controlUI/crafting/crafting.js';
import { ControlUI } from './controlUI/controlUI.js';
import { CraftingBar } from './statusBar/craftingBar/craftingBar.js';


function importAll (r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}
const images = importAll(require.context('./../assets/items', false,  /\.png$/));

// move crafting UI and inventory to control UI

export function App() {
    return (
        <>
            <div id="interface">
                <ControlUI />
                <HealthBar />
                <HungerBar />
                <CraftingBar />
                <Leaderboard />
            </div>
        </>
    )
}
