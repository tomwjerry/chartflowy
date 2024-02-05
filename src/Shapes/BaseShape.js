'use strict';

export default class BaseShape {
    // What SVG shape this refers to, should be a direct reference
    corrospondingShape;
    corrospondingShapeID;
    // Array of recomendend connections, positions to connect paths to
    recomendedConnections;
    // Arrary of all currently paths lines
    currentlyConnections;
    
    oldBBox;

    constructor() {
        this.recomendedConnections = [];
        this.allConnections = [];
    }

    // Handles, to resize the figure, bade on the bounding box
    getResizeHandles() {
        const boundingBox = this.corrospondingShape.getBBox();

        return [
            {
                x: boundingBox.x,
                y: boundingBox.y
            },
            {
                x: boundingBox.x + boundingBox.width,
                y: boundingBox.y
            },
            {
                x: boundingBox.x + boundingBox.width,
                y: boundingBox.y + boundingBox.height
            },
            {
                x: boundingBox.x,
                y: boundingBox.y + boundingBox.height
            }
        ];
    }

    getRecommendedConnections() {
        return this.recomendedConnections;
    }

    getCorropspondingShape() {
        return this.corrospondingShape;
    }

    resize(newSize) {}
}
