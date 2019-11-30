import React from 'react';

import { Inventory } from "./inventory/inventory.js";
import { HealthBar } from './healthbar/healthbar.js';

export function App() {
    return (
        <>
            <div id="interface">
                <Inventory />
                <HealthBar />
            </div>
        </>
    )
}
