'use strict';

import BaseShape from './BaseShape';

export default class TextShape extends BaseShape {
    constructor(attr) {
        super();

        this.name = 'TextShape';

        this.corrospondingShape = Util.makeSVGElement('g');
    }

    resize(newSize) {
    }
}
