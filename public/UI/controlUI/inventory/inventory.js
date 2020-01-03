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
const images = importAll(require.context('./../../../assets/items', false,  /\.png$/)); // maybe later, add it so images are loaded dynamically, and only when the player has the item

export class Inventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerID: player.clientID,
            playerInventory: player.inventory,
            
            nickname: window.localStorage.getItem('nickname'),
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
            playerInventory: player.inventory,
        });
    }

    render() {
        const inventoryComponents = [];
        // <Row className='items' variant="primary">{item}{" x"}{amount}</Row>
        for (let [item, amount] of Object.entries(this.state.playerInventory)) { // concat Image because the filename has Image at the end of it
            inventoryComponents.push(
                <div key={item} className="controlUIItem">
                    <div className='controlUIItemName'>{item}{" x"}{amount}</div>
                    <Image className='controlUIImage' src={this.state.images[item.concat('.png')] }/>
                    
                </div>
            )
        }
        /* 
            <Row className='items' variant="primary">Wood x{this.state.wood}</Row>
            <Row variant="primary"><Image className='images' src={this.state.woodImage}/></Row>
            <Row className='items' variant="primary">Stone x{this.state.stone}</Row>
            <Row variant="primary"><Image className='images' src={this.state.stoneImage}/></Row>
        */
        return(
            <> 
                <div>
                    {inventoryComponents.length !== 0 && 
                        <Col>
                            {inventoryComponents}
                        </Col>
                    }
                </div>
            </>
        )
    }
}