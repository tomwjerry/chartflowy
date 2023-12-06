'use strict';

export class FlowchartEditor {
    svgelement;
    settings;

    constructor(svgelement, settings) {
        this.svgelement = svgelement;
        this.settings = settings;
        
        // Hide some stuff
        this.disable();
    }

    createBoxClick(ev) {

    }

    toolboxClick(ev) {

    }
 
    enable() {
        const createBox = this.settings.createBoxElement;
        const propertyBox = this.settings.propertyBoxElement;
        const toolbox = this.settings.toolboxElement;

        createBox.style.display = 'unset';
        propertyBox.style.display = 'unset';
        toolbox.style.display = 'unset';

        createBox.addEventListener('click', this.createBoxClick);
        toolbox.addEventListener('click', this.toolboxClick);
    }

    disable() {
        const createBox = this.settings.createBoxElement;
        const propertyBox = this.settings.propertyBoxElement;
        const toolbox = this.settings.toolboxElement;

        createBox.style.display = 'none';
        propertyBox.style.display = 'none';
        toolbox.style.display = 'none';

        createBox.removeEventListener('click', this.createBoxClick);
        toolbox.removeEventListener('click', this.toolboxClick);
    }
}
