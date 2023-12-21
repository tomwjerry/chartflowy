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
}

export class ModifyCommand extends BaseCommand {
    item;
    attributes;
    oldAttributes;

    constructor(item, attributes) {
        super();
        this.item = item;
        this.attributes = attributes;
    }

    execute() {
        this.oldAttributes = JSON.stringify(this.item.attributes);

        for (let attr of this.attributes) {
            this.item.setAttribute(attr.name, attr.value);
        }
    }

    undo() {
        const setOldAttributes = JSON.parse(this.oldAttributes);

        for (let attr of setOldAttributes) {
            this.item.setAttribute(attr.name, attr.value);
        }
    }
}
