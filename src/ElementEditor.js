'use strict';

import EllipseShape from './Shapes/EllipseShape';
import RectangleShape from './Shapes/RectangleShape';
import RhombShape from './Shapes/RhombShape';

import Util from './Util';

import { CreateCommand, ModifyCommand } from './ActionDispatcher';

export default class ElementEditor {
    editor;
    workArea;
    undoRedo;

    shouldCreate;
    resizeDirections;
    selectedElement;
    listOfElements;
    elementLookup;
    nextid;

    constructor(editor, workArea, undoRedo) {
        this.editor = editor;
        this.workArea = workArea;
        this.undoRedo = undoRedo;

        this.shouldCreate = false;
        this.selectedElement = null;
        this.shouldAddElement = false;
        this.listOfElements = [];
        this.elementLookup = new Map;
        this.nextid = 0;
    }

    selectcreate(datashape) {
        this.clearSelection();
        switch (datashape) {
            case 'rect':
                this.selectedElement = new RectangleShape({ width: '100', height: '50' });
                break;
            case 'roundrect':
                this.selectedElement = new RectangleShape({ width: '100', height: '60', rx: '15' });
                break;
            case 'rhomb':
                this.selectedElement = new RhombShape({ width: '100', height: '100' });
                break;
            case 'circle':
                this.selectedElement = new EllipseShape({ width: '100', height: '100' });
                break;
            case 'ellipse':
                this.selectedElement = new EllipseShape({ width: '100', height: '60' });
                break;
            default:
                break;
        }

        const guiGroup = Util.makeSVGElement('g');
        const eleid = 'fce_' + this.nextid;
        const svgShape = this.selectedElement.getCorropspondingShape();
        guiGroup.setAttribute('class', 'gui');
        svgShape.setAttribute('stroke', '#000000');
        svgShape.setAttribute('fill', '#ffffff');
        svgShape.setAttribute('id', eleid);

        this.nextid++;
        this.elementLookup.set(eleid, this.listOfElements.length);
        this.listOfElements.push(this.selectedElement);
        guiGroup.appendChild(svgShape);
        this.workArea.appendChild(guiGroup);
        this.shouldCreate = true;
    }

    clearSelection() {
        const oldSelections = this.workArea.querySelectorAll('.resize-handle');

        for (let rmSel of oldSelections) {
            rmSel.remove();
        }
    }

    doSelectElement() {
        const svgGroup = this.selectedElement.getCorropspondingShape().parentNode;
        if (!svgGroup.querySelector('.resize-handle')) {
            // Make selection borders and corners
            const handles = this.selectedElement.getResizeHandles();

            for (let i = 0; i < handles.length; i++) {
                const border = Util.makeSVGElement('line');
                border.setAttribute('class', 'resize-handle edge');
                border.setAttribute('x1', handles[i].x);
                border.setAttribute('y1', handles[i].y);
                border.setAttribute('x2', handles[(i + 1) % handles.length].x);
                border.setAttribute('y2', handles[(i + 1) % handles.length].y);
                svgGroup.appendChild(border);
            }

            for (let i = 0; i < handles.length; i++) {
                const corner = Util.makeSVGElement('circle');
                corner.setAttribute('class', 'resize-handle corner');
                corner.setAttribute('cx', handles[i].x);
                corner.setAttribute('cy', handles[i].y);
                corner.setAttribute('r', '5');
                svgGroup.appendChild(corner);
            }
        }
    }

    /**
     * Determine if mouse position is inside the selected element resize border
     */
    checkInsisideResize(pos) {
        if (this.selectedElement) {
            const tolerance = 4;
            const elementBBox = this.selectedElement.getCorropspondingShape().getBBox();
            const actualPos = this.selectedElement
                .getCorropspondingShape().getBoundingClientRect();
            const resizeBounds = {
                minLeft: actualPos.x - tolerance,
                minTop: actualPos.y - tolerance,
                minRight: actualPos.x + elementBBox.width - tolerance,
                minBottom: actualPos.y + elementBBox.height - tolerance,
                maxLeft: actualPos.x + tolerance,
                maxTop: actualPos.y + tolerance,
                maxRight: actualPos.x + elementBBox.width + tolerance,
                maxBottom: actualPos.y + elementBBox.height + tolerance
            };

            const foundResizePos = {
                left: pos.x >= resizeBounds.minLeft && pos.x <= resizeBounds.maxLeft,
                right: pos.x >= resizeBounds.minRight && pos.x <= resizeBounds.maxRight,
                top: pos.y >= resizeBounds.minTop && pos.y <= resizeBounds.maxTop,
                bottom: pos.y >= resizeBounds.minBottom && pos.y <= resizeBounds.maxBottom
            };

            if (!foundResizePos.left &&
                !foundResizePos.right &&
                !foundResizePos.top &&
                !foundResizePos.bottom) {
                return false;
            }

            return foundResizePos;
        }

        return false;
    }

    positionalPress(ev, pos) {
        // If we press the handles
        const checkResizeDir = this.checkInsisideResize(pos);
        if (checkResizeDir != false) {
            this.editor.setCurrentCommand('resize');
            this.resizeDirections = checkResizeDir;
            
            return;
        }

        this.selectedElement = null;
        this.clearSelection();
        if (this.elementLookup.has(ev.target.id)) {
            this.selectedElement =
                this.listOfElements[this.elementLookup.get(ev.target.id)];
            this.doSelectElement();
            this.editor.setCurrentCommand('move');
        }
    }

    positionalMove(pos) {
        if (!this.selectedElement) {
            return;
        }
        const currentCommand = this.editor.getCurrentCommand();

        if (currentCommand == 'create' ||
            currentCommand == 'move') {
            const shape = this.selectedElement.getCorropspondingShape().parentNode;
            shape.setAttribute('transform', 'translate(' + pos.x + ', ' + pos.y + ')');

            if (this.shouldCreate) {
                this.shouldCreate = false;
                this.undoRedo.addHistory(new CreateCommand(
                    this.selectedElement, this.workArea));
            } else {
                this.undoRedo.addHistory(new ModifyCommand(
                    this.selectedElement, this.selectedElement.attributes));
            }

        // If we actively resize
        } else if (currentCommand == 'resize') {
            // First we want to get the actual boundingbox
            // I think the client bounding box might not be accurate so I might
            // need to combine it with SVG BBox
            // We need to convert to relative corridates
            // (isnt scale n' transform more simple?)
            const resizePositionBox = this.selectedElement
                .getCorropspondingShape().getBoundingClientRect();
            const resizeBoundingBox = this.selectedElement
                .getCorropspondingShape().getBBox();
            const relativeResizePositionBox = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };

            // Second, we have saved the resize direction, so yes
            // the infameous check every direction strikes again!
            // Update the approate corner in the bounding box
            if (this.resizeDirections.top) {
                relativeResizePositionBox.y = pos.y - resizePositionBox.y;
            } else if (this.resizeDirections.bottom) {
                relativeResizePositionBox.height =
                    pos.y - resizePositionBox.y - resizeBoundingBox.height;
            }
            if (this.resizeDirections.left) {
                relativeResizePositionBox.x = pos.x - resizePositionBox.x;
            } else if (this.resizeDirections.right) {
                // Does this really works?
                relativeResizePositionBox.width =
                    pos.x - resizePositionBox.x - resizeBoundingBox.width;
            }

            // Finally, call the resize method that update the size.
            // We probally do not want to scale, thats ugly, but more simple
            this.selectedElement.resize(relativeResizePositionBox);

        // Here we just check if we can resize, to update mouse cursor
        } else {
            const shouldResize = this.checkInsisideResize(pos);
            this.editor.svgElement.classList.remove(
                'cur-rsnesw', 'cur-rsnwse', 'cur-rsns', 'cur-rsew');
            if (shouldResize != false) {
                if (shouldResize.left || shouldResize.right) {
                    if (shouldResize.top) {
                        if (shouldResize.right) {
                            this.editor.svgElement.classList.add('cur-rsnesw');
                        } else {
                            this.editor.svgElement.classList.add('cur-rsnwse');
                        }
                    } else if (shouldResize.bottom) {
                        if (shouldResize.right) {
                            this.editor.svgElement.classList.add('cur-rsnwse');
                        } else {
                            this.editor.svgElement.classList.add('cur-rsnesw');
                        }
                    } else {
                        this.editor.svgElement.classList.add('cur-rsew');
                    }
                } else if (shouldResize.top || shouldResize.bottom) {
                    this.editor.svgElement.classList.add('cur-rsns');
                }
            }
        }
    }

    positionalRelease() {
        if (!this.selectedElement) {
            return;
        }
        // Make resize borders if there are none
        this.doSelectElement();
    }
}
