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
}
