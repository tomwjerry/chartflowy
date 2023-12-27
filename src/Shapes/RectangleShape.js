'use strict';

import BaseShape from './BaseShape';
import Util from '../Util';

export default class RectangleShape extends BaseShape {
    constructor(attr) {
        super();

        this.corrospondingShape = Util.makeSVGElement('rect');
        this.corrospondingShape.setAttribute('x', -(attr.width / 2));
        this.corrospondingShape.setAttribute('y', -(attr.height / 2));
        this.corrospondingShape.setAttribute('width', attr.width);
        this.corrospondingShape.setAttribute('height', attr.height);

        if (attr.rx) {
            this.corrospondingShape.setAttribute('rx', attr.rx);
        }
    }

    resize(newSize) {
        const beforeBBox = this.corrospondingShape.getBBox();
        this.corrospondingShape.setAttribute('x', beforeBBox.x + newSize.x);
        this.corrospondingShape.setAttribute('width',
            beforeBBox.width + newSize.width - newSize.x);
        this.corrospondingShape.setAttribute('y', beforeBBox.y + newSize.y);
        this.corrospondingShape.setAttribute('height',
                beforeBBox.height + newSize.height - newSize.y);
    }
}
