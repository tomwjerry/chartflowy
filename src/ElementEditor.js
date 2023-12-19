'use strict';

import RectangleShape from './Shapes/RectangleShape';

export default class ElementEditor {
    svgelement;
    editor;
    selectedElement;
    listOfElements;
    elementLookup;
    nextid;

    constructor(editor, svgelement) {
        this.editor = editor;
        this.svgelement = svgelement;
        this.selectedElement = null;
        this.shouldAddElement = false;
        this.listOfElements = [];
        this.elementLookup = new Map;
        this.nextid = 0;
    }

    selectcreate(datashape) {
        switch (datashape) {
            case 'rect':
                this.selectedElement = new RectangleShape;
                break;
            case 'roundrect':
                this.selectedElement = new RectangleShape({ round: '15' });
                break;
            default:
                break;
        }

        const svgShape = this.selectedElement.getCorropspondingShape();
        svgShape.setAttribute('stroke', '#000000');
        svgShape.setAttribute('fill', 'none');
        const eleid = 'fce_' + this.nextid;
        this.nextid++;
        this.elementLookup.set(eleid, this.listOfElements.length);
        this.listOfElements.push(svgShape);
        this.svgelement.appendChild(svgShape);
    }

    mainpulationupdate(pos) {
        if (!this.selectedElement) {
            return;
        }
        this.selectedElement.move(pos);
    }

    mainpulationdone() {
        this.selectedElement = null;
    }
}
