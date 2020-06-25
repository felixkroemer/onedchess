import React from 'react';
import './Square.css';
import Piece from './Piece';

export default class Square extends React.Component {
    render() {
        var className = "square";
        className += this.props.id % 2 == 0 ? " black" : " white";
        return (<div className={className}>
            <Piece type={this.props.type} />
        </div>)
    }
}
