import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

// custom style sheets
import './inventory.css';
import './../styles.css';

// images
import { player } from '../../app';

function importAll (r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}
const images = importAll(require.context('./../../assets/inventory', false,  /\.png$/));

export class Inventory extends React.Component {
    constructor() {
        super();
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
        const inventory = [];
        for (let [item, amount] of Object.entries(this.state.playerInventory)) { // concat Image because the filename has Image at the end of it
            inventory.push(
                <div key={item}>
                    <Row className='items' variant="primary">{item}{" x"}{amount}</Row>
                    <Row variant="primary"><Image className='images' src={this.state.images[item.concat('.png')] }/></Row>
                </div>
            )
        }
        /* 
            <Row className='items' variant="primary">Wood x{this.state.wood}</Row>
            <Row variant="primary"><Image className='images' src={this.state.woodImage}/></Row>
            <Row className='items' variant="primary">Stone x{this.state.stone}</Row>
            <Row variant="primary"><Image className='images' src={this.state.stoneImage}/></Row>
        */
        return( // return react fragment
            <> 
                <div id="name" className='overlayContainer'>{this.state.nickname}</div>
                {inventory.length !== 0 && 
                    <Col className='overlayContainer'>
                        {inventory}
                    </Col>
                }
            </>
        )
    }
}