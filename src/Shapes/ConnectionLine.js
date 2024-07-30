'use strict';

import BaseShape from './BaseShape';
import Util from '../Util';

export default class ConnectionLine extends BaseShape {
    constructor(attr) {
        super();

        this.corrospondingShape = Util.makeSVGElement('path');
    }

    resize(newSize) {
    }
}
