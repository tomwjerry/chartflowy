'use strict';

import ElementEditor from './ElementEditor';
import UndoRedo from './UndoRedo';

export class FlowchartEditor {
    svgelement;
    settings;
    currentCommand;
    eventList;

    shapeCreatorObj;
    elementEditorObj;
    UndoRedoObj;

    constructor(svgelement, settings) {
        this.svgelement = svgelement;
        this.settings = settings;
        this.currentCommand = null;
        this.signals = {};

        this.elementEditorObj = new ElementEditor(this, this.svgelement);
        this.UndoRedoObj = new UndoRedo(this);

        this.eventList = [];
        this.eventList.push([
            this.settings.createBoxElement,
            'mousedown',
            this.handleEvent.bind(this)
        ]);
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
                if (this.currentCommand != 'create') {
                    this.currentCommand = 'create';
                    this.elementEditorObj.selectcreate(ev.target.dataset.shape);
                }
            }
        } else if (ev.type == 'mousemove') {
            const pt = new DOMPoint(ev.clientX, ev.clientY);
            this.elementEditorObj.mainpulationupdate(pt);
        } else if (ev.type == 'mouseup') {
            this.currentCommand = 'move';
            this.elementEditorObj.mainpulationdone();
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
