import React from 'react';

import { Inventory } from "./inventory/inventory.js";
import { HealthBar } from './healthbar/healthbar.js';
import { Leaderboard } from './leaderboard/leaderboard.js';

export function App() {
    return (
        <>
            <div id="interface">
                <Inventory />
                <HealthBar />
                <Leaderboard />
            </div>
        </>
    )
}
