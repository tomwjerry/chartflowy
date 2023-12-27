'use strict';

import BaseShape from './BaseShape';
import Util from '../Util';

export default class RhombShape extends BaseShape {
    constructor(attr) {
        super();

        this.corrospondingShape = Util.makeSVGElement('path');
        this.corrospondingShape.setAttribute('d', 'M 0 ' + ' ' + (-(attr.height / 2)) +
            ' L ' + (attr.width / 2) + ' 0' +
            ' L 0 ' + (attr.height / 2) +
            ' L ' + (-(attr.width / 2)) + ' 0 z');
    }

    resize(newSize) {
        const beforeBBox = this.corrospondingShape.getBBox();
        const topEdge = beforeBBox.y + newSize.y;
        const leftEdge = beforeBBox.x + newSize.x;
        const bottomEdge = newSize.height + (beforeBBox.height / 2);
        const rightEdge = newSize.width + (beforeBBox.width / 2);
        
        this.corrospondingShape.setAttribute('d', 'M 0 ' + ' ' + topEdge +
            ' L ' + rightEdge + ' 0' +
            ' L 0 ' + bottomEdge +
            ' L ' + leftEdge + ' 0 z');
    }
}
