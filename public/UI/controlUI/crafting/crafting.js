import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';


// images
import { player } from '../../../app';

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
            
            images: images,
        }
    }
    
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 60); // learn more about this
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() { 
        this.setState({
            craftableItems: craftableItemsState,
        });
    }

    render() {
        const craftingComponents = [];
        for (let i = 0; i < this.state.craftableItems.length; i++) {
            craftingComponents.push(
                <div key={this.state.craftableItems[i]} className="controlUIItem">
                    <div className='controlUIItemName'>{this.state.craftableItems[i]}</div>
                    <Image className='controlUIImage' src={this.state.images['stone.png']} />
                </div>
            )
        }
        /*
                <div key={item} className="inventoryItem">
                    <div className='amount'>{item}{" x"}{amount}</div>
                    <Image className='image' src={this.state.images[item.concat('.png')] }/>
                    
                </div>*/
        return(
            <> 
                <div id='craftingContainerWrapper'>
                    <div id='craftingContainer'>
                        {craftingComponents.length !== 0 && 
                            <Col>
                                {craftingComponents}
                            </Col>
                        }
                    </div>
                </div>
            </>
        )
    }
}