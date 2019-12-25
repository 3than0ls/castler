import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

// custom style sheets
import './crafting.css';
import './../styles.css';

// images
import { player } from '../../app';

function importAll (r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}
const images = importAll(require.context('./../../assets/inventory', false,  /\.png$/));

export class Crafting extends React.Component {
    constructor() {
        super();
        this.state = {
            playerID: player.clientID,
            canCraft: {},
            
            images: images,
        }
    }
    /*
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 60); // learn more about this
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() { 
        this.setState({
            playerInventory: player.inventory,
        });
    }*/

    render() {
        const craftingComponents = [];
        // <Row className='items' variant="primary">{item}{" x"}{amount}</Row>
        for (let [item, amount] of Object.entries(this.state.canCraft)) { // concat Image because the filename has Image at the end of it
            craftingComponents.push(
                <div key={item} className="craftingItem">
                    <Image className='image' src={this.state.images[item.concat('.png')] }/>
                </div>
            )
        }
        return(
            <> 
                <div id='craftingContainerWrapper'>
                    <div  id='craftingyContainer'>
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