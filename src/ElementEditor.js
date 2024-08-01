'use strict';

import EllipseShape from './Shapes/EllipseShape';
import RectangleShape from './Shapes/RectangleShape';
import RhombShape from './Shapes/RhombShape';
import ConnectionLine from './Shapes/ConnectionLine';
import 'path-data-polyfill';

import Util from './Util';

import { CreateCommand, ModifyCommand } from './ActionDispatcher';

export default class ElementEditor {
    editor;
    workArea;
    undoRedo;

    shouldCreate;
    resizeDirections;
    lineHandleManipulate;
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
        this.resizeDirections = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };
        this.lineHandleManipulate = 0;
        this.elementLookup = new Map;
        this.nextid = 0;
    }

    /**
     * Creates shape
     * @param {string} datashape 
     */
    selectcreate(datashape) {
        this.clearSelection();
        switch (datashape) {
            case 'rect':
                this.selectedElement = new RectangleShape({ width: 100, height: 60 });
                break;
            case 'roundrect':
                this.selectedElement = new RectangleShape({
                    width: 100, height: 60, rx: 15 });
                break;
            case 'rhomb':
                this.selectedElement = new RhombShape({ width: 100, height: 100 });
                break;
            case 'circle':
                this.selectedElement = new EllipseShape({ width: 100, height: 100 });
                break;
            case 'ellipse':
                this.selectedElement = new EllipseShape({ width: 100, height: 60 });
                break;
            case 'connectionline':
                this.selectedElement = new ConnectionLine({ width: 60, height: 60 });
                break;
            default:
                break;
        }

        // Element around the shape that contains gui elements
        const guiGroup = Util.makeSVGElement('g');
        guiGroup.setAttribute('class', 'gui');

        // Shape itself
        const svgShape = this.selectedElement.getCorropspondingShape();
        const eleid = 'fce_' + this.nextid;
        svgShape.setAttribute('stroke', '#000000');
        svgShape.setAttribute('fill', '#ffffff');
        svgShape.setAttribute('id', eleid);

        // Put shape in group
        guiGroup.appendChild(svgShape);
        this.workArea.appendChild(guiGroup);
        
        // Set lookup tables to find the shape later
        this.selectedElement.corrospondingShapeID = eleid;
        this.elementLookup.set(eleid, this.listOfElements.length);
        this.listOfElements.push(this.selectedElement);
        
        // Set some basic modes
        this.shouldCreate = true;
        this.nextid++;
    }

    /**
     * Removes selection gui elements
     */
    clearSelection() {
        const oldSelections = this.workArea.querySelectorAll(
            '.resize-handle, .connector, .line-modify-handle');

        for (let rmSel of oldSelections) {
            rmSel.remove();
        }
    }

    /**
     * Selects element, yeah the element is already selected so draw some borders
     * around it. Make resize handles.
     */
    doSelectElement() {
        const corshape = this.selectedElement.getCorropspondingShape();
        const svgGroup = corshape.parentNode;

        // Ofcourse, we dont have to do it if there already are resize handlers
        if (svgGroup.querySelector('.resize-handle, .line-modify-handle')) {
            return;
        }

        // Connector line special case
        if (this.selectedElement.name == 'ConnectionLine') {
            const pathpoints = corshape.getPathData();
            
            for (let i = 0; i < pathpoints.length; i++) {
                const conhandle = Util.makeSVGElement('circle');
                conhandle.dataset.pathIndex = i;
                conhandle.setAttribute('class', 'line-modify-handle');
                conhandle.setAttribute('cx', pathpoints[i].values[0]);
                conhandle.setAttribute('cy', pathpoints[i].values[1]);
                conhandle.setAttribute('r', 5);
                svgGroup.appendChild(conhandle);
            }

            return;
        }
        
        const boundingBox = corshape.getBBox();
        // Make selection borders and corners
        const handles = [
            {
                x: boundingBox.x,
                y: boundingBox.y,
                cx: boundingBox.x + boundingBox.width / 2,
                cy: boundingBox.y - 15
            },
            {
                x: boundingBox.x + boundingBox.width,
                y: boundingBox.y,
                cx: boundingBox.x + boundingBox.width + 15,
                cy: boundingBox.y + boundingBox.height / 2
            },
            {
                x: boundingBox.x + boundingBox.width,
                y: boundingBox.y + boundingBox.height,
                cx: boundingBox.x + boundingBox.width / 2,
                cy: boundingBox.y + boundingBox.height + 15
            },
            {
                x: boundingBox.x,
                y: boundingBox.y + boundingBox.height,
                cx: boundingBox.x - 15,
                cy: boundingBox.y + boundingBox.height / 2
            }
        ];

        // Resize borders around object, also put connector handles in the middle
        for (let i = 0; i < handles.length; i++) {
            const border = Util.makeSVGElement('line');
            const x2 = handles[(i + 1) % handles.length].x;
            const y2 = handles[(i + 1) % handles.length].y;
            border.setAttribute('class', 'resize-handle edge');
            border.setAttribute('x1', handles[i].x);
            border.setAttribute('y1', handles[i].y);
            border.setAttribute('x2', x2);
            border.setAttribute('y2', y2);
            svgGroup.appendChild(border);

            // Connector handle
            const conhandle = Util.makeSVGElement('circle');
            conhandle.setAttribute('class', 'connector');
            conhandle.setAttribute('cx', handles[i].cx);
            conhandle.setAttribute('cy', handles[i].cy);
            conhandle.setAttribute('r', 5);
            svgGroup.appendChild(conhandle);
        }

        // Resize corners, we need to have an extra loop just to enure
        // they are in top of the borders.
        // Ofcourse another way would be to offset borders with corner radius
        for (let i = 0; i < handles.length; i++) {
            const corner = Util.makeSVGElement('circle');
            corner.setAttribute('class', 'resize-handle corner');
            corner.setAttribute('cx', handles[i].x);
            corner.setAttribute('cy', handles[i].y);
            corner.setAttribute('r', 5);
            svgGroup.appendChild(corner);
        }
    }

    /**
     * Determine if mouse position is inside the selected element resize border
     */
    checkInsisideResize(pos) {
        if (this.selectedElement) {
            const tolerance = 5;
            const shape = this.selectedElement.getCorropspondingShape();
            const elementBBox = shape.getBBox();
            const actualPos = shape.getBoundingClientRect();
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

    /**
     * Put text in shape
     */
    setSelectedElementText() {
        const enteredText = this.editor.svgElement.parentNode
            .querySelector('.svgtexteditor');

        if (!enteredText) {
            return;
        }
        if (this.selectedElement) {
            const selPar = this.selectedElement.getCorropspondingShape().parentNode;
            let textElement = selPar.querySelector('text');
            if (textElement) {
                textElement.textContent = '';
            } else {
                // Create text element if it doesn't exists
                textElement = Util.makeSVGElement('text');
                textElement.setAttribute('text-anchor', 'middle');
                selPar.appendChild(textElement);
            }
            const textLines = enteredText.querySelector('.input')
                .innerText.split('\n');
            for (let i = 0; i < textLines.length; i++) {
                const textrow = Util.makeSVGElement('tspan');
                textrow.setAttribute('dy', (i > 0 ? 1 : 0.41) + 'em');
                textrow.setAttribute('x', 0);
                textrow.textContent = textLines[i];
                textElement.appendChild(textrow);
            }
            textElement.setAttribute('y', (1 - textLines.length / 2) + 'em');
        }
        enteredText.remove();
    }

    getElementAttributes(shape) {
        const selshape = shape.getCorropspondingShape();
        const shapeParams = selshape.attributes;
        const containerParams = selshape.parentNode.attributes;
        let shapeArray = [[],[]];
        for (const attr of shapeParams) {
            shapeArray[0].push([attr.name, attr.value]);
        }

        for (const attr of containerParams) {
            shapeArray[1].push([attr.name, attr.value]);
        }

        return shapeArray;
    }

    getAllElementBounds(shape) {
        const shapeToResize = shape
            .getCorropspondingShape();
        const resizePositionBox =
            shapeToResize.getBoundingClientRect();
        const resizeBoundingBox = shapeToResize.getBBox();

        // The position we have before
        const translateToParse = shapeToResize.parentNode.
            getAttribute('transform');
        const beforeTranslate = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(
            translateToParse);

        return {
            x: resizeBoundingBox.x,
            y: resizeBoundingBox.y,
            width: resizeBoundingBox.width,
            height: resizeBoundingBox.height,
            absoluteX: resizePositionBox.x,
            absoluteY: resizePositionBox.y,
            absoluteWidth: resizePositionBox.width,
            absoluteHeight: resizePositionBox.height,
            translateX: parseFloat(beforeTranslate[1]),
            translateY: parseFloat(beforeTranslate[2])
        };
    }

    /**
     * This function handles: select shape, start/stop move, start/stop resize,
     * start/stop text edit and start/stap draw connector.
     * 
     * @param {*} ev 
     * @param {*} pos 
     * @returns 
     */
    positionalPress(ev, pos) {
        // Save old attributes for undo and stuff
        if (this.selectedElement) {
            const attrs = this.getElementAttributes(this.selectedElement);
            this.selectedElement.oldAttributes = attrs[0];
            this.selectedElement.oldContainerAttributes = attrs[1];
        }

        // Modify connection line
        if (ev.target.classList.contains('line-modify-handle')) {
            this.editor.setCurrentCommand('connect');
            this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
            this.lineHandleManipulate = ev.target.dataset.pathIndex;

            return;
        }

        // Resize
        // If we press the handles
        const checkResizeDir = this.checkInsisideResize(pos);
        if (checkResizeDir != false) {
            this.setSelectedElementText();
            this.editor.setCurrentCommand('resize');
            // Save what handle we used for resizing
            this.resizeDirections = checkResizeDir;

            // Save our orginal position here
            this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
            
            return;
        }

        // Connect
        if (ev.target.classList.contains('connector')) {
            const connector = ev.target;
            const connectorPos = connector.getBoundingClientRect();
            this.selectcreate('connectionline');
            const connectorline = this.selectedElement.getCorropspondingShape();
            const connectorlineContainer = connectorline.parentNode;

            const cx = parseInt(connector.getAttribute('cx'));
            const cy = parseInt(connector.getAttribute('cy'));

            if (cx != 0) {
                connectorPos.x += cx > 0 ? -10 : 20;
            }

            if (cy != 0) {
                connectorPos.y += cy > 0 ? -10 : 20;
            }

            connectorline.setAttribute('d', 'M 0 0 L 0 0'); // Needed to get pathdata
            connectorlineContainer.setAttribute('transform', 'translate(' +
                connectorPos.x + ',' + connectorPos.y + ')');
            this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
            
            this.editor.setCurrentCommand('connect');
            this.lineHandleManipulate = 1;

            return;
        }

        // On click we set currently typed text
        this.setSelectedElementText();

        const oldSelected = this.selectedElement;
        // Change what shape is selected
        this.selectedElement = null;
        this.clearSelection();

        // Find the shapes in the list of shapes, then select new!
        // TODO: If it is same element we dont need to do this
        if (this.elementLookup.has(ev.target.id)) {
            this.selectedElement =
                this.listOfElements[this.elementLookup.get(ev.target.id)];
            this.doSelectElement();
            this.editor.setCurrentCommand('move');

            const attrs = this.getElementAttributes(this.selectedElement);
            this.selectedElement.oldAttributes = attrs[0];
            this.selectedElement.oldContainerAttributes = attrs[1];
        }

        // Edit text
        if (oldSelected && oldSelected == this.selectedElement) {
            let textEdit = this.editor.svgElement.parentNode.querySelector('.svgtexteditor');
            if (textEdit) {
                if (textEdit.dataset.currentEdit != oldSelected.corrospondingShapeID) {
                    textEdit.remove();
                    textEdit = false;
                }
            }
            
            // Create a text editor
            if (!textEdit) {
                textEdit = document.createElement('div');
                textEdit.className = 'svgtexteditor';
                const corshape = this.selectedElement
                    .getCorropspondingShape();
                const shapeCentre = corshape.getBoundingClientRect();
                // Position the text editor
                textEdit.style.left = shapeCentre.x + 'px';
                textEdit.style.top = shapeCentre.y + 'px';
                const inputInner = document.createElement('div');
                inputInner.contentEditable = true;
                inputInner.className = 'input';
                inputInner.style.width = shapeCentre.width + 'px';
                inputInner.style.height = shapeCentre.height + 'px';

                // If we already have text in the shape, put the text as input value
                const textele = corshape.parentNode.querySelector('text');
                if (textele) {
                    const textspans = textele.querySelectorAll('tspan');
                    for (let i = 0; i < textspans.length; i++) {
                        if (i > 0) {
                            inputInner.innerHTML += '<br>';
                        }
                        inputInner.innerHTML += textspans[i].textContent;
                    }
                    textele.textContent = '';
                }

                textEdit.appendChild(inputInner);
                this.editor.svgElement.parentNode.appendChild(textEdit);
                // Focus on the editor so you can type
                setTimeout(() => {
                    inputInner.focus();
                });
            }
        }
    }

    /**
     * On mouse move
     * @param {*} pos 
     */
    positionalMove(pos) {
        if (!this.selectedElement) {
            return;
        }
        const currentCommand = this.editor.getCurrentCommand();

        // Create / move element
        if (currentCommand == 'create' ||
            currentCommand == 'move') {
            const shape = this.selectedElement.getCorropspondingShape().parentNode;
            shape.setAttribute('transform', 'translate(' + pos.x + ',' + pos.y + ')');

            if (this.shouldCreate) {
                this.shouldCreate = false;
                this.undoRedo.addHistory(new CreateCommand(
                    shape, this.workArea));
            }
        
        // If we actively resize
        } else if (currentCommand == 'resize') {
            // First we want to get the actual boundingbox
            // I think the client bounding box might not be accurate so I might
            // need to combine it with SVG BBox
            // We need to convert to relative corridates
            // (isnt scale n' transform more simple?)
            const shapeToResize = this.selectedElement
                .getCorropspondingShape();
            const oldBBox = this.selectedElement.oldBBox;
            
            const relativeResizePositionBox = {
                x: oldBBox.translateX,
                y: oldBBox.translateY,
                width: oldBBox.width,
                height: oldBBox.height
            };

            // Second, we have saved the resize direction, so yes
            // the infameous check every direction strikes again!
            // Update the approate corner in the bounding box
            if (this.resizeDirections.top) {
                relativeResizePositionBox.height = oldBBox.height + oldBBox.absoluteY - pos.y;
                relativeResizePositionBox.y = pos.y + (relativeResizePositionBox.height / 2);
            } else if (this.resizeDirections.bottom) {
                relativeResizePositionBox.height = pos.y - oldBBox.absoluteY;
                relativeResizePositionBox.y = pos.y - (relativeResizePositionBox.height / 2);
            }
            if (this.resizeDirections.left) {
                relativeResizePositionBox.width = oldBBox.width + oldBBox.absoluteX - pos.x;
                relativeResizePositionBox.x = pos.x + (relativeResizePositionBox.width / 2);
            } else if (this.resizeDirections.right) {
                relativeResizePositionBox.width = pos.x - oldBBox.absoluteX;
                relativeResizePositionBox.x = pos.x - (relativeResizePositionBox.width / 2);
            }

            // Translate is more simplier than updating parameters, and just works
            shapeToResize.parentNode.
                setAttribute('transform', 'translate(' +
                    relativeResizePositionBox.x + ',' +
                    relativeResizePositionBox.y + ')');

            // Finally, call the resize method that update the size.
            // We probally do not want to scale, thats ugly, but more simple
            this.selectedElement.resize(relativeResizePositionBox);

        // Connector line update, actually very similar to resize
        } else if (currentCommand == 'connect') {
            const connectorShape = this.selectedElement.getCorropspondingShape();
            const updatePos = { x: 0, y: 0 };
            updatePos.x = pos.x - this.selectedElement.oldBBox.translateX;
            updatePos.y = pos.y - this.selectedElement.oldBBox.translateY;
            const pathdata = connectorShape.getPathData();
            pathdata[this.lineHandleManipulate].values = [updatePos.x, updatePos.y];
            connectorShape.setPathData(pathdata); // Apparently needed
            
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

    /**
     * Relese mouse position
     */
    positionalRelease() {
        if (!this.selectedElement) {
            return;
        }
        // Save the history
        const attrs = this.getElementAttributes(this.selectedElement);
        
        this.undoRedo.addHistory(new ModifyCommand(
            this.selectedElement.getCorropspondingShape(),
            attrs[0], this.selectedElement.oldAttributes));
        this.undoRedo.addHistory(new ModifyCommand(
            this.selectedElement.getCorropspondingShape().parentNode,
            attrs[1], this.selectedElement.oldContainerAttributes));
        // Make resize borders if there are none
        this.doSelectElement();
    }
}
