'use strict';

import BaseShape from './BaseShape';

export default class TextShape extends BaseShape {
    constructor(attr) {
        super();

        this.corrospondingShape = Util.makeSVGElement('g');
    }

    resize(newSize) {
    }
}
