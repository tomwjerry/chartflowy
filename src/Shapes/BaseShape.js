'use strict';

export default class BaseShape {
    name;
    // What SVG shape this refers to, should be a direct reference
    corrospondingShape;
    corrospondingShapeID;
    // Arrary of all currently paths lines
    allConnections;
    // Store our orginal position
    oldBBox;
    oldAttributes;
    oldContainerAttributes;

    constructor() {
        this.allConnections = [];
    }

    getCorropspondingShape() {
        return this.corrospondingShape;
    }

    resize(newSize) {}
}
