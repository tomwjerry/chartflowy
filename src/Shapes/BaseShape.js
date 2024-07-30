'use strict';

export default class BaseShape {
    // What SVG shape this refers to, should be a direct reference
    corrospondingShape;
    corrospondingShapeID;
    // Arrary of all currently paths lines
    allConnections;
    // Store our orginal position
    oldBBox;

    constructor() {
        this.recomendedConnections = [];
        this.allConnections = [];
    }

    getCorropspondingShape() {
        return this.corrospondingShape;
    }

    resize(newSize) {}
}
