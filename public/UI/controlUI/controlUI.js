import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

// custom style sheets
import './controlUI.css';
import './../styles.css';


// images
import { player } from '../../app';
import { Inventory } from './inventory/inventory';
import { CraftingUI } from './crafting/crafting';


export class ControlUI extends React.Component {
    constructor() {
        super();
        this.state = {
            inventoryView: true,
        }

        this.inventoryClick = this.inventoryClick.bind(this);
        this.craftingClick = this.craftingClick.bind(this);
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
        });
    }*/

    inventoryClick() {
        this.setState({
            inventoryView: true,
        });
    }

    craftingClick() {
        this.setState({
            inventoryView: false,
        });
    }

    render() { // perhaps replace with react bootstrap tabbed components
        return(
            <> 
                <div id="controlUIWrapper">
                    <div id="controlUIContainer">
                        <Row>
                            <Button variant='uiItem' key={'inventory'} active={this.state.inventoryView} onClick={this.inventoryClick}>
                                Inv
                            </Button>
                            <Button variant='uiItem' key={'crafting'} active={!this.state.inventoryView} onClick={this.craftingClick}>
                                Cra
                            </Button>
                        </Row>
                        {this.state.inventoryView ? (
                            <div id='inventoryContainer'><Inventory /></div>
                        ) : (
                            <div id='craftingContainer'><CraftingUI /></div>
                        )}
                    </div>
                </div>
            </>
        )
    }
}