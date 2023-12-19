'use strict';

import BaseShape from "./BaseShape";

export default class RectangleShape extends BaseShape {
    constructor(attr) {
        super();
        this.corrospondingShape =
            document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.corrospondingShape.setAttribute('width', '100');
        this.corrospondingShape.setAttribute('height', '60');

        if (attr) {
            if (attr.round) {
                this.corrospondingShape.setAttribute('rx', attr.round);
            }
        }
    }

    getRecommendedConnections() {
    }
}
