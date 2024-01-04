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
        this.corrospondingShape.setAttribute('d', 'M 0 ' + ' ' +
            (-(newSize.height / 2)) +
            ' L ' + (newSize.width / 2) + ' 0' +
            ' L 0 ' + (newSize.height / 2) +
            ' L ' + (-(newSize.width / 2)) + ' 0 z');
    }
}
