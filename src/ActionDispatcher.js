'use strict';

class BaseCommand {
    execute() {
    }

    undo() {
    }
}

// Make a command pattern of following functions: create, delete and modify
export class CreateCommand extends BaseCommand {
    item;
    oldItem;
    context;

    constructor(item, context) {
        super();
        this.item = item;
        this.context = context;
    }

    execute() {
        if (!this.item) {
            this.item = JSON.parse(this.oldItem);
        }
        this.context.appendChild(this.item);
    }

    undo() {
        this.oldItem = JSON.stringify(this.item);
        this.item.remove();
        this.item = null;
    }

    checkChange() {
        return true;
    }
}

export class DeleteCommand extends BaseCommand {
    item;
    oldItem;
    context;

    constructor(item) {
        super();
        this.item = item;
    }

    execute() {
        this.oldItem = JSON.stringify(this.item);
        this.item.remove();
        this.item = null;
    }

    undo() {
        this.item = JSON.parse(this.oldItem);
        this.context.appendChild(this.item);
    }

    checkChange() {
        return true;
    }
}

export class ModifyCommand extends BaseCommand {
    item;
    attributes;
    oldAttributes;

    constructor(item, attributes, oldAttributes) {
        super();
        this.item = item;
        this.attributes = attributes;
        this.oldAttributes = oldAttributes;
        if (!this.oldAttributes) {
            this.oldAttributes = [];
        }
    }

    execute() {
        //this.oldAttributes = this.item.attributes;

        for (let attr of this.attributes) {
            this.item.setAttribute(attr[0], attr[1]);
        }
    }

    undo() {
        for (let attr of this.oldAttributes) {
            this.item.setAttribute(attr[0], attr[1]);
        }
    }

    checkChange() {
        if (this.attributes === this.oldAttributes) {
            return false;
        }
        if (this.attributes == null || this.oldAttributes == null) {
            return true;
        }
        if (this.attributes.length !== this.oldAttributes.length) {
            return true;
        }
      
        for (let i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i][0] !== this.oldAttributes[i][0]) {
                return true;
            }
            if (this.attributes[i][1] !== this.oldAttributes[i][1]) {
                return true;
            }
        }

        return false;
    }
}
