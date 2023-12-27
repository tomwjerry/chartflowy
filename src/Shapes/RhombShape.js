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
        const oldHalfHeight = beforeBBox.height / 2;
        const oldHalfWidth = beforeBBox.width / 2;
        const oldCenterX = beforeBBox.x + newSize.x + oldHalfWidth - newSize.width;
        const oldCenterY = beforeBBox.y + newSize.y + oldHalfHeight - newSize.height;
        
        const centerX = oldCenterX + beforeBBox.x + oldHalfWidth;
        const centerY = oldCenterY + beforeBBox.y + oldHalfHeight;
        const halfWidth = (oldCenterX - oldHalfWidth) - (beforeBBox.x + oldHalfWidth);
        const halfHeight = (oldCenterY - oldHalfHeight) - (beforeBBox.y + oldHalfHeight);
        
        const drawPositions = [
            centerX,
            centerY - halfHeight,
            centerX + halfWidth,
            centerY,
            centerX,
            centerY + halfHeight,
            oldCenterX - halfWidth,
            centerY
        ];
        
        this.corrospondingShape.setAttribute('d', 'M ' +
            drawPositions[0] + ' ' + drawPositions[1] +
            ' L ' + drawPositions[2] + ' ' + drawPositions[3] +
            ' L ' + drawPositions[4] + ' ' + drawPositions[5] +
            ' L ' + drawPositions[6] + ' ' + drawPositions[7] + ' z');
    }
}
