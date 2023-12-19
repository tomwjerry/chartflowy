'use strict';

export default class UndoRedo {
    history;
    historyIndex;

    constructor() {
        this.history = [];
        this.historyIndex = -1;
    }

    addHistory(command) {
        this.history.push(command);
        this.historyIndex = this.history.length - 1;
    }

    undo() {
        if (this.historyIndex >= 0) {
            this.history[this.historyIndex].undo();
            this.historyIndex--;
            if (this.historyIndex < 0) {
                this.historyIndex = -1;
            }
        }
    }

    redo() {
        if (this.historyIndex < this.history.length) {
            this.history[this.historyIndex].execute();
            this.historyIndex++;
            if (this.historyIndex > this.history.length) {
                this.historyIndex = this.history.length;
            }
        }
    }
}
