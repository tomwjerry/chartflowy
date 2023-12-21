'use strict';

export default class Util {
    static makeSVGElement(svgElement) {
        return document.createElementNS('http://www.w3.org/2000/svg', svgElement);
    }
}
