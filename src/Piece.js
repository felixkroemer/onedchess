import React from 'react';
import './Piece.css';
import wqueen from './pieces/wqueen.svg';
import bqueen from './pieces/bqueen.svg';
import wrook from './pieces/wrook.svg';
import brook from './pieces/brook.svg';
import wknight from './pieces/wknight.svg';
import bknight from './pieces/bknight.svg';
import { ItemTypes } from './ItemTypes';
import { useDrag } from 'react-dnd'

const Piece = (props) => {

    const [{ isDragging }, drag, preview] = useDrag({
        item: { type: ItemTypes.KNIGHT },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    })

    if (props.type == null) {
        return null;
    } else {
        var piece = null;
        console.log(props.type[1]);
        switch (props.type[1]) {
            case ItemTypes.ROOK:
                piece = props.type[0] ? brook : wrook;
                break;
            case ItemTypes.KNIGHT:
                piece = props.type[0] ? bknight : wknight;
                break;
            case ItemTypes.QUEEN:
                piece = props.type[0] ? bqueen : wqueen;
                break;
        }
        return (<img src={piece}></img>);
    }
}
export default Piece;