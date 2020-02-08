import React from 'react';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';

// images
import { images } from './../controlUI/controlUI.js';

import './staticInventory.css';
import { player, socket } from '../../app.js';
import { clientLootCrate } from '../../sockets/player/clientLootCrate.js';

export class CrateInventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: images,
            player: player
        }
        this.onExit = this.onExit.bind(this);
        this.onLoot = this.onLoot.bind(this);
    }

    onExit() {
        player.openCrate = false;
    }

    onLoot() {
        clientLootCrate(socket, player.targetCrate.crateID);
    }

    render() {
        function displayRename(itemName) {
            let name = '';
            for (let i = 0; i < itemName.length; i++) {
                let char = itemName.charAt(i);
                if (char == char.toUpperCase()) {
                    name += ` ${char.toLowerCase()}`;
                } else {
                    name += char;
                }
            }
            return name;
        }
        const item = Object.keys(this.props.item)[0];
        const amount = this.props.item[item].amount;
        const itemName = displayRename(item);
        return(
            <> 
                <div className="staticInventoryWrapper">
                    <div className="staticInventoryContainer">
                        <div className="staticInventoryItem">
                            <div className="staticInventoryName">
                                {itemName} x{amount}
                            </div>
                            <Image className='staticInventoryImage' src={this.state.images[`${item}.png`]}/>
                        </div>
                        <div className="staticInventoryOptions">
                            <Button variant="loot" onClick={this.onLoot}>
                                Loot
                            </Button>
                            <Button variant="exit" onClick={this.onExit}>
                                Exit
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}