import React from 'react';
import './Field.css';
import wqueen from './pieces/wqueen.svg';
import bqueen from './pieces/bqueen.svg';
import wrook from './pieces/wrook.svg';
import brook from './pieces/brook.svg';
import wknight from './pieces/wknight.svg';
import bknight from './pieces/bknight.svg';

export default class Field extends React.Component {

    renderSquare(black, piece) {
        let className = "square";
        className += black ? " black" : " white";
        return (<div className = {className}>
            <img src={piece}></img>
        </div>);
    }
  
    render() {
      return (
        <div id="field">
            {this.renderSquare(false, wrook)}
            {this.renderSquare(true, wknight)}
            {this.renderSquare(false, wqueen)}
            {this.renderSquare(true, wknight)}
            {this.renderSquare(false, wrook)}
            {this.renderSquare(true, null)}
            {this.renderSquare(false, null)}
            {this.renderSquare(true, brook)}
            {this.renderSquare(false, bknight)}
            {this.renderSquare(true, bqueen)}
            {this.renderSquare(false, bknight)}
            {this.renderSquare(true, brook)}
        </div>
      );
    }
  }