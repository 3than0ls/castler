import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import './crafting.css';


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
        const craftingComponents = [];
        for (let i = 0; i < this.state.craftableItems.length; i++) {
            craftingComponents.push(
                <Button variant='craftingItem' key={this.state.craftableItems[i]} className="controlUIItem"
                onClick={() => this.itemClick(this.state.craftableItems[i])} disabled={this.state.craftingState.crafting}>
                    <div className='controlUIItemName'>{this.state.craftableItems[i]}</div>
                    <Image className='controlUIImage' src={this.state.images['stone.png']} />
                </Button>
            )
        }

                /*
                <div id='craftingContainerWrapper'>
                    <div id='craftingContainer'>
                        {craftingComponents.length !== 0 && 
                            <Col>
                                {craftingComponents}
                            </Col>
                        }
                    </div>
                </div>
                */
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