import React from 'react';
import './Square.css';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';

export default function Square(props) {

    const [{ canDrop }, drop] = useDrop({
        accept: [ItemTypes.KNIGHT, ItemTypes.QUEEN, ItemTypes.ROOK],
        canDrop: monitor => props.canDrop(monitor.id, props.id),
        drop: monitor => props.onDrop(monitor.id, props.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    })

    var className = "square";
    className += props.id % 2 === 1 ? " black" : " white";
    return (
        <div className={className} ref={drop}>
            {props.children}
        </div>
    )
}
