import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

// images
import { player, socket } from '../../../app';
import { clientRequestCraft } from '../../../sockets/player/clientRequestCraft';

function importAll (r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}
const images = importAll(require.context('./../../../assets/items', false,  /\.png$/));

export const craftableItemsState = [];

export class CraftingUI extends React.Component {
    constructor() {
        super();
        this.state = {
            playerID: player.clientID,
            craftableItems: craftableItemsState,

            craftingState: player.craftingState,
            images: images,
        }
    }
    
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 100); // learn more about this
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() { 
        this.setState({
            craftableItems: craftableItemsState,
            craftingState: player.craftingState,
        });
    }

    itemClick(item) {
        clientRequestCraft(socket, item);
    }

    render() {
        function displayRename(itemName) {
            let name = '';
            for (let i = 0; i < itemName.length; i++) {
                let char = itemName.charAt(i);
                if (char == char.toUpperCase() || char == '_') {
                    name += ` ${char.toLowerCase()}`;
                } else {
                    name += char;
                }
            }
            return name;
        }

        const componentKeys = [];
        const craftingComponents = [];
        for (let i = 0; i < this.state.craftableItems.length; i++) {
            let key = this.state.craftableItems[i]; // we can tell if a crafting item is displayed twice if the key already exists when a same one is being added
            if (componentKeys.includes(key)) continue; // if the crafting item is already displayed, don't display it twice
            else {
                componentKeys.push(key);
                craftingComponents.push(
                    <Button variant='clickItem' key={key} className="controlUIItem disableSelect"
                    onClick={() => this.itemClick(this.state.craftableItems[i])} disabled={this.state.craftingState.crafting}>
                        <div className='controlUIItemName'>{displayRename(this.state.craftableItems[i])}</div>
                        <Image className='controlUIImage' src={this.state.images[this.state.craftableItems[i].concat('.png')]} />
                    </Button>
                )
            }
        }
        return(
            <> 
                <div>
                    {craftingComponents.length !== 0 && 
                        <Col>
                            {craftingComponents}
                        </Col>
                    }
                </div>
            </>
        )
    }
}