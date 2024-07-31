'use strict';

import BaseShape from './BaseShape';
import Util from '../Util';

export default class EllipseShape extends BaseShape {
    constructor(attr) {
        super();

        this.name = 'EllipseShape';

        this.corrospondingShape = Util.makeSVGElement('ellipse');
        this.corrospondingShape.setAttribute('cx', 0);
        this.corrospondingShape.setAttribute('cy', 0);
        this.corrospondingShape.setAttribute('rx', attr.width / 2);
        this.corrospondingShape.setAttribute('ry', attr.height / 2);
    }

    resize(newSize) {
        this.corrospondingShape.setAttribute('rx', newSize.width / 2);
        this.corrospondingShape.setAttribute('ry', newSize.height / 2);
    }
}
