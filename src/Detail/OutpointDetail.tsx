import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Hex from './Hex';
export class OutpointDetail extends React.Component<{
    txid: string;
    n: number;
    onClick: () => void;
}> {
    render() {
        return (<ListGroup variant="flush" className="OutpointDetail">
            <ListGroup.Item variant="dark">
                <h4> Outpoint </h4>
            </ListGroup.Item>
            <ListGroup.Item variant="dark">
                <ListGroup horizontal={'lg'} className="COutPoint">
                    <ListGroup.Item variant="dark">
                        Hash
                </ListGroup.Item>
                    <ListGroup.Item variant="dark">
                        <Hex className="txhex" readOnly value={this.props.txid} />
                    </ListGroup.Item>
                    <ListGroup.Item variant="dark">
                        Index
                </ListGroup.Item>
                    <ListGroup.Item variant="dark">
                        {this.props.n}
                    </ListGroup.Item>
                    <ListGroup.Item action variant="success" onClick={this.props.onClick}>Go</ListGroup.Item>
                </ListGroup>

            </ListGroup.Item>
        </ListGroup>);
    }
}


export class TXIDDetail extends React.Component<{
    txid: string;
}> {
    render() {
        return (<ListGroup horizontal className="TXIDDetail">
            <ListGroup.Item variant="dark">
                <h4> TXID </h4>
            </ListGroup.Item>
            <ListGroup.Item className="TXID" variant="dark">
                <Hex className="txhex" readOnly value={this.props.txid} />
            </ListGroup.Item>
        </ListGroup>);
    }
}