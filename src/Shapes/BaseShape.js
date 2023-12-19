'use strict';

export default class BaseShape {
    corrospondingShape;
    boundingBox;
    handles;
    recomendedConnections;
    allConnections;

    getCorropspondingShape() {
        return this.corrospondingShape;
    }

    move(pos) {
        this.corrospondingShape.setAttribute('x', pos.x);
        this.corrospondingShape.setAttribute('y', pos.y);
    }

    getHandles() {
        if (!this.handles) {
            if (!this.boundingBox) {
                this.boundingBox = this.corrospondingShape.getBBox();
            }
            this.handles = [
                {
                    x: this.boundingBox.x,
                    y: this.boundingBox.y
                },
                {
                    x: this.boundingBox.x + this.boundingBox.width,
                    y: this.boundingBox.y
                },
                {
                    x: this.boundingBox.x + this.boundingBox.width,
                    y: this.boundingBox.y + this.boundingBox.height
                },
                {
                    x: this.boundingBox.x,
                    y: this.boundingBox.y + this.boundingBox.height
                }
            ];
        }

        return this.boundingBox;
    }

    getRecommendedConnections() {
    }
}
