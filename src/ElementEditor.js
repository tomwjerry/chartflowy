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

    resizeDirections;
    lineHandleManipulate;
    connectorSnapping;
    selectedElement;
    listOfElements;
    elementLookup;
    nextid;
    oldMovePosition;

    constructor(editor, workArea, undoRedo) {
        this.editor = editor;
        this.workArea = workArea;
        this.undoRedo = undoRedo;

        this.selectedElement = null;
        this.shouldAddElement = false;
        this.listOfElements = [];
        this.resizeDirections = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };
        this.connectorSnapping = {
            canSnap: false,
            snapShapeId: null,
            snapTo: null
        };
        this.lineHandleManipulate = 0;
        this.elementLookup = new Map;
        this.nextid = 0;
        this.oldMovePosition = { x: 0, y: 0 };
    }

    /**
     * Creates shape
     * @param {string} datashape 
     */
    selectcreate(datashape) {
        if (this.selectedElement) {
            this.selectedElement.getCorropspondingShape().parentNode.classList.remove('selected');
        }

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
        this.nextid++;
    }

    /**
     * Selects element, yeah the element is already selected so draw some borders
     * around it. Make resize handles.
     */
    doSelectElement(selElement) {
        this.selectedElement = selElement;
        const corshape = selElement.getCorropspondingShape();
        const svgGroup = corshape.parentNode;
        svgGroup.classList.add('selected');

        // Ofcourse, we dont have to do it if there already are resize handlers
        if (svgGroup.querySelector('.resize-handle, .line-modify-handle')) {
            return;
        }

        // Connector line special case
        if (selElement.name == 'ConnectionLine') {
            const pathpoints = corshape.getPathData();
            
            for (let i = 0; i < pathpoints.length; i++) {
                const conhandle = Util.makeSVGElement('circle');
                conhandle.dataset.pathIndex = i;
                if (i == pathpoints.length - 1) {
                    conhandle.dataset.pathIsLast = true;
                }
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
                cy: boundingBox.y - 15,
                closecx: boundingBox.x + boundingBox.width / 2,
                closecy: boundingBox.y
            },
            {
                x: boundingBox.x + boundingBox.width,
                y: boundingBox.y,
                cx: boundingBox.x + boundingBox.width + 15,
                cy: boundingBox.y + boundingBox.height / 2,
                closecx: boundingBox.x + boundingBox.width,
                closecy: boundingBox.y + boundingBox.height / 2
            },
            {
                x: boundingBox.x + boundingBox.width,
                y: boundingBox.y + boundingBox.height,
                cx: boundingBox.x + boundingBox.width / 2,
                cy: boundingBox.y + boundingBox.height + 15,
                closecx: boundingBox.x + boundingBox.width / 2,
                closecy: boundingBox.y + boundingBox.height
            },
            {
                x: boundingBox.x,
                y: boundingBox.y + boundingBox.height,
                cx: boundingBox.x - 15,
                cy: boundingBox.y + boundingBox.height / 2,
                closecx: boundingBox.x,
                closecy: boundingBox.y + boundingBox.height / 2
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
            let conhandle = Util.makeSVGElement('circle');
            conhandle.setAttribute('class', 'connector');
            conhandle.setAttribute('cx', handles[i].cx);
            conhandle.setAttribute('cy', handles[i].cy);
            conhandle.setAttribute('r', 5);
            svgGroup.appendChild(conhandle);

            // Connection suggestion
            conhandle = Util.makeSVGElement('circle');
            conhandle.setAttribute('class', 'connection-suggestion');
            conhandle.id = corshape.id + '_close_' + i;
            conhandle.setAttribute('cx', handles[i].closecx);
            conhandle.setAttribute('cy', handles[i].closecy);
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

    /**
     * Get attibutes of shape and its container in an array
     * where first element is name and second is value
     * @param {*} shape 
     * @returns 
     */
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

    /**
     * Get all bounds of shape along with parsed translation
     */
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
            this.connectorSnapping.canSnap =
                ev.target.dataset.pathIndex == 0 ||
                this.selectedElement.getCorropspondingShape().dataset.pathIsLast;

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
            const oldSelShape = this.listOfElements[this.elementLookup.get(
                this.selectedElement.corrospondingShapeID)];
            this.selectcreate('connectionline');
            oldSelShape.allConnections.push({
                id: this.selectedElement.corrospondingShapeID,
                point: 0
            });
            const connectorline = this.selectedElement.getCorropspondingShape();
            const connectorlineContainer = connectorline.parentNode;

            const cx = parseInt(connector.getAttribute('cx'));
            const cy = parseInt(connector.getAttribute('cy'));

            if (cx != 0) {
                connectorPos.x += cx > 0 ? -10 : 20;
                connectorPos.y += 5;
            }

            if (cy != 0) {
                connectorPos.y += cy > 0 ? -10 : 20;
                connectorPos.x += 10;
            }

            connectorline.setAttribute('d', 'M 0 0 L 0 0'); // Needed to get pathdata
            connectorlineContainer.setAttribute('transform', 'translate(' +
                connectorPos.x + ',' + connectorPos.y + ')');
            this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
            
            this.editor.setCurrentCommand('connect');
            this.lineHandleManipulate = 1;
            this.connectorSnapping.canSnap = true;

            return;
        }

        // On click we set currently typed text
        this.setSelectedElementText();

        const oldSelected = this.selectedElement;
        if (oldSelected) {
            oldSelected.getCorropspondingShape().parentNode.classList.remove('selected');
        }
        // Change what shape is selected
        this.selectedElement = null;

        // Find the shapes in the list of shapes, then select new!
        // TODO: If it is same element we dont need to do this
        if (this.elementLookup.has(ev.target.id)) {
            this.doSelectElement(this.listOfElements[this.elementLookup.get(ev.target.id)]);

            // Save old attributes
            this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
            this.oldMovePosition = {
                x: this.selectedElement.oldBBox.translateX,
                y: this.selectedElement.oldBBox.translateY
            };

            const attrs = this.getElementAttributes(this.selectedElement);
            this.selectedElement.oldAttributes = attrs[0];
            this.selectedElement.oldContainerAttributes = attrs[1];

            this.editor.setCurrentCommand('move');
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
    positionalMove(pos, target) {
        if (!this.selectedElement) {
            return;
        }
        const currentCommand = this.editor.getCurrentCommand();

        // Create / move element
        if (currentCommand == 'create' ||
            currentCommand == 'move') {
            const dx = pos.x - this.oldMovePosition.x;
            const dy = pos.y - this.oldMovePosition.y;
            this.oldMovePosition = pos;
            const shape = this.selectedElement.getCorropspondingShape().parentNode;
            shape.setAttribute('transform', 'translate(' + pos.x + ',' + pos.y + ')');

            if (currentCommand == 'create') {
                this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
                this.editor.setCurrentCommand('move');
                this.undoRedo.addHistory(new CreateCommand(
                    shape, this.workArea));
            } else if (currentCommand == 'move') {
                for (const connectordata of this.selectedElement.allConnections) {
                    const connector = this.listOfElements[this.elementLookup.get(connectordata.id)];
                    const connectorShape = connector.getCorropspondingShape();
                    const conPoss = connectorShape.getPathData();

                    conPoss[connectordata.point].values[0] += dx;
                    conPoss[connectordata.point].values[1] += dy;
                    connectorShape.setPathData(conPoss); 
                }
            }
        
        // If we actively resize
        } else if (currentCommand == 'resize') {
            // First we want to get the actual boundingbox
            // We need to convert to relative corridates
            const shapeToResize = this.selectedElement
                .getCorropspondingShape();
            const oldBBox = this.selectedElement.oldBBox;
            const oldSize = shapeToResize.getBoundingClientRect();
            
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
            const newSize = shapeToResize.getBoundingClientRect();

            for (const connectordata of this.selectedElement.allConnections) {
                const connector = this.listOfElements[this.elementLookup.get(connectordata.id)];
                const connectorShape = connector.getCorropspondingShape();
                const connBBox = connectorShape.getBoundingClientRect();

                // First find what corner at the bounding box that the path touches:
                // top left, top right, bottom left, bottom right
                const connectorPointsLen = connectorShape.getTotalLength();
                const relevantPointPos = connectorShape.getPointAtLength(
                    connectordata.point == 0 ? 0 : connectorPointsLen
                );
                const finalConPos = {
                    x: relevantPointPos.x + connBBox.x,
                    y: relevantPointPos.y + connBBox.y
                };

                const pathdata = connectorShape.getPathData();
                
                // Second find what side connector are at
                // if the connect is at affected side, update it, else do not do anything
                if (this.resizeDirections.left) {
                    if (finalConPos.x < relativeResizePositionBox.x + relativeResizePositionBox.width) {
                        pathdata[connectordata.point].values[0] += (oldSize.width - newSize.width);
                    }
                } else if (this.resizeDirections.right) {
                    if (finalConPos.x > relativeResizePositionBox.x) {
                        pathdata[connectordata.point].values[0] -= (oldSize.width - newSize.width);
                    }
                }
                if (this.resizeDirections.top) {
                    if (finalConPos.y < relativeResizePositionBox.y + relativeResizePositionBox.height) {
                        pathdata[connectordata.point].values[1] += (oldSize.height - newSize.height);
                    }
                } else if (this.resizeDirections.bottom) {
                    if (finalConPos.y > relativeResizePositionBox.y) {
                        pathdata[connectordata.point].values[1] -= (oldSize.height - newSize.height);
                    }
                }

                connectorShape.setPathData(pathdata); 
            }

        // Connector line update, actually very similar to resize
        } else if (currentCommand == 'connect') {
            const connectorShape = this.selectedElement.getCorropspondingShape();
            const updatePos = { x: 0, y: 0 };
            updatePos.x = pos.x - this.selectedElement.oldBBox.translateX;
            updatePos.y = pos.y - this.selectedElement.oldBBox.translateY;
            const pathdata = connectorShape.getPathData();

            // Try to snap to connector
            if (target.classList.contains('connection-suggestion')) {
                this.connectorSnapping.snapTo = target.id;
                target.classList.add('highlight');
                const connectorPos = target.getBoundingClientRect();
                updatePos.x = connectorPos.x - this.selectedElement.oldBBox.translateX + 5;
                updatePos.y = connectorPos.y - this.selectedElement.oldBBox.translateY + 5;
            // Show handles if we are close to an element
            } else {
                this.connectorSnapping.snapShapeId = target.id;
                // Remove old highlight
                const highlightedHandles = this.editor.svgElement.querySelectorAll('.highlight');
                for (const handle of highlightedHandles) {
                    handle.classList.remove('highlight');
                }

                const previousSuggestion = this.editor.svgElement.querySelectorAll(
                    '.connection-suggest:not(#' + target.id + ')');
                for (const suggestion of previousSuggestion) {
                    suggestion.classList.remove('connection-suggest');
                }

                if (this.elementLookup.has(target.id)) {
                    this.listOfElements[this.elementLookup.get(target.id)]
                        .getCorropspondingShape().parentNode.classList.add('connection-suggest');
                }
            }

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
        
        // Special case for connection lines
        if (this.editor.getCurrentCommand() == 'connect' &&
            this.connectorSnapping.snapShapeId && this.connectorSnapping.snapTo) {
            const connectedElement =
                this.listOfElements[this.elementLookup.get(this.connectorSnapping.snapShapeId)];
            connectedElement.allConnections.push({
                id: this.selectedElement.corrospondingShapeID,
                point: this.lineHandleManipulate
            });

            const suggestedShape = this.editor.svgElement.querySelector('.connection-suggest');
            if (suggestedShape) {
                suggestedShape.classList.remove('connection-suggest');
            }
            this.selectedElement = null;
            return;
        }

        // Make resize borders if there are none
        this.doSelectElement(this.selectedElement);
    }
}
