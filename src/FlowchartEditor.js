'use strict';

import ElementEditor from './ElementEditor';
import UndoRedo from './UndoRedo';
import Util from './Util';

export class FlowchartEditor {
    svgElement;
    workArea;
    settings;
    currentCommand;
    eventList;

    shapeCreatorObj;
    elementEditorObj;
    UndoRedoObj;

    constructor(svgElement, settings) {
        this.svgElement = svgElement;
        this.settings = settings;
        this.currentCommand = null;
        this.signals = {};

        this.workArea = Util.makeSVGElement('g');
        this.svgElement.appendChild(this.workArea);

        this.UndoRedoObj = new UndoRedo(this);
        this.elementEditorObj = new ElementEditor(this, this.workArea, this.UndoRedoObj);

        this.eventList = [];
        this.eventList.push([
            this.settings.createBoxElement,
            'mousedown',
            this.handleEvent.bind(this)
        ]);
        this.eventList.push([document, 'mousedown', this.handleEvent.bind(this)]);
        this.eventList.push([document, 'mousemove', this.handleEvent.bind(this)]);
        this.eventList.push([document, 'mouseup', this.handleEvent.bind(this)]);
        
        // Hide some stuff
        this.disable();
    }

    getCurrentCommand() {
        return this.currentCommand;
    }
    
    setCurrentCommand(setCommand) {
        this.currentCommand = setCommand;
    }

    handleEvent(ev) {
        if (ev.type == 'mousedown') {
            if (ev.target.classList.contains('createbox-button')) {
                if (this.currentCommand != 'create' &&
                    this.currentCommand != 'move' &&
                    this.currentCommand != 'resize') {
                    this.currentCommand = 'create';
                    this.elementEditorObj.selectcreate(ev.target.dataset.shape);
                }
            } else if (ev.target.classList.contains('toolbox-button')) {
                if (ev.target.dataset.tool == 'undo') {
                    this.UndoRedoObj.undo();
                } else if (ev.target.dataset.tool == 'redo') {
                    this.UndoRedoObj.redo();
                }
            } else {
                this.elementEditorObj.positionalPress(ev, new DOMPoint(ev.clientX, ev.clientY));
            }
        } else if (ev.type == 'mousemove') {
            const pt = new DOMPoint(ev.clientX, ev.clientY);
            this.elementEditorObj.positionalMove(pt);
        } else if (ev.type == 'mouseup') {
            this.currentCommand = '';
            this.elementEditorObj.positionalRelease();
        }
    }
 
    enable() {
        const createBox = this.settings.createBoxElement;
        const propertyBox = this.settings.propertyBoxElement;
        const toolbox = this.settings.toolboxElement;

        createBox.style.display = 'unset';
        propertyBox.style.display = 'unset';
        toolbox.style.display = 'unset';

        for (let bev of this.eventList) {
            bev[0].addEventListener(bev[1], bev[2]);
        }
    }

    disable() {
        const createBox = this.settings.createBoxElement;
        const propertyBox = this.settings.propertyBoxElement;
        const toolbox = this.settings.toolboxElement;

        createBox.style.display = 'none';
        propertyBox.style.display = 'none';
        toolbox.style.display = 'none';

        for (let bev of this.eventList) {
            bev[0].removeEventListener(bev[1], bev[2]);
        }
    }
}
