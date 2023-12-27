'use strict';

import BaseShape from './BaseShape';
import Util from '../Util';

export default class EllipseShape extends BaseShape {
    constructor(attr) {
        super();

        this.corrospondingShape = Util.makeSVGElement('ellipse');
        this.corrospondingShape.setAttribute('cx', 0);
        this.corrospondingShape.setAttribute('cy', 0);
        this.corrospondingShape.setAttribute('rx', attr.width / 2);
        this.corrospondingShape.setAttribute('ry', attr.height / 2);
    }

    resize(newSize) {
        const beforeBBox = this.corrospondingShape.getBBox();
        
        this.corrospondingShape.setAttribute('cx',
            beforeBBox.x + newSize.x + ((beforeBBox.width + newSize.width) / 2));
        this.corrospondingShape.setAttribute('rx',
            (((beforeBBox.width + newSize.width) / 2)) - newSize.x);
        this.corrospondingShape.setAttribute('cy',
            beforeBBox.y + newSize.y + ((beforeBBox.height + newSize.height) / 2));
        this.corrospondingShape.setAttribute('ry',
            (((beforeBBox.height + newSize.height) / 2)) - newSize.y);
    }
}
