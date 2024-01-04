"use strict";
var jssvgflow = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/FlowchartEditor.js
  var FlowchartEditor_exports = {};
  __export(FlowchartEditor_exports, {
    FlowchartEditor: () => FlowchartEditor
  });

  // src/Shapes/BaseShape.js
  var BaseShape = class {
    // What SVG shape this refers to, should be a direct reference
    corrospondingShape;
    // Array of recomendend connections, positions to connect paths to
    recomendedConnections;
    // Arrary of all currently paths lines
    currentlyConnections;
    oldBBox;
    constructor() {
      this.recomendedConnections = [];
      this.allConnections = [];
    }
    // Handles, to resize the figure, bade on the bounding box
    getResizeHandles() {
      const boundingBox = this.corrospondingShape.getBBox();
      return [
        {
          x: boundingBox.x,
          y: boundingBox.y
        },
        {
          x: boundingBox.x + boundingBox.width,
          y: boundingBox.y
        },
        {
          x: boundingBox.x + boundingBox.width,
          y: boundingBox.y + boundingBox.height
        },
        {
          x: boundingBox.x,
          y: boundingBox.y + boundingBox.height
        }
      ];
    }
    getRecommendedConnections() {
      return this.recomendedConnections;
    }
    getCorropspondingShape() {
      return this.corrospondingShape;
    }
    resize(newSize) {
    }
  };

  // src/Util.js
  var Util = class {
    static makeSVGElement(svgElement) {
      return document.createElementNS("http://www.w3.org/2000/svg", svgElement);
    }
  };

  // src/Shapes/EllipseShape.js
  var EllipseShape = class extends BaseShape {
    constructor(attr) {
      super();
      this.corrospondingShape = Util.makeSVGElement("ellipse");
      this.corrospondingShape.setAttribute("cx", 0);
      this.corrospondingShape.setAttribute("cy", 0);
      this.corrospondingShape.setAttribute("rx", attr.width / 2);
      this.corrospondingShape.setAttribute("ry", attr.height / 2);
    }
    resize(newSize) {
      this.corrospondingShape.setAttribute("rx", newSize.width / 2);
      this.corrospondingShape.setAttribute("ry", newSize.height / 2);
    }
  };

  // src/Shapes/RectangleShape.js
  var RectangleShape = class extends BaseShape {
    constructor(attr) {
      super();
      this.corrospondingShape = Util.makeSVGElement("rect");
      this.corrospondingShape.setAttribute("x", -attr.width / 2);
      this.corrospondingShape.setAttribute("y", -attr.height / 2);
      this.corrospondingShape.setAttribute("width", attr.width);
      this.corrospondingShape.setAttribute("height", attr.height);
      if (attr.rx) {
        this.corrospondingShape.setAttribute("rx", attr.rx);
      }
    }
    resize(newSize) {
      this.corrospondingShape.setAttribute("x", -newSize.width / 2);
      this.corrospondingShape.setAttribute("y", -newSize.height / 2);
      this.corrospondingShape.setAttribute("width", newSize.width);
      this.corrospondingShape.setAttribute("height", newSize.height);
    }
  };

  // src/Shapes/RhombShape.js
  var RhombShape = class extends BaseShape {
    constructor(attr) {
      super();
      this.corrospondingShape = Util.makeSVGElement("path");
      this.corrospondingShape.setAttribute("d", "M 0  " + -(attr.height / 2) + " L " + attr.width / 2 + " 0 L 0 " + attr.height / 2 + " L " + -(attr.width / 2) + " 0 z");
    }
    resize(newSize) {
      this.corrospondingShape.setAttribute("d", "M 0  " + -(newSize.height / 2) + " L " + newSize.width / 2 + " 0 L 0 " + newSize.height / 2 + " L " + -(newSize.width / 2) + " 0 z");
    }
  };

  // src/ActionDispatcher.js
  var BaseCommand = class {
    execute() {
    }
    undo() {
    }
  };
  var CreateCommand = class extends BaseCommand {
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
  };
  var ModifyCommand = class extends BaseCommand {
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
  };

  // src/ElementEditor.js
  var ElementEditor = class {
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
      this.elementLookup = /* @__PURE__ */ new Map();
      this.nextid = 0;
    }
    selectcreate(datashape) {
      this.clearSelection();
      switch (datashape) {
        case "rect":
          this.selectedElement = new RectangleShape({ width: 100, height: 60 });
          break;
        case "roundrect":
          this.selectedElement = new RectangleShape({
            width: 100,
            height: 60,
            rx: 15
          });
          break;
        case "rhomb":
          this.selectedElement = new RhombShape({ width: 100, height: 100 });
          break;
        case "circle":
          this.selectedElement = new EllipseShape({ width: 100, height: 100 });
          break;
        case "ellipse":
          this.selectedElement = new EllipseShape({ width: 100, height: 60 });
          break;
        default:
          break;
      }
      const guiGroup = Util.makeSVGElement("g");
      const eleid = "fce_" + this.nextid;
      const svgShape = this.selectedElement.getCorropspondingShape();
      guiGroup.setAttribute("class", "gui");
      svgShape.setAttribute("stroke", "#000000");
      svgShape.setAttribute("fill", "#ffffff");
      svgShape.setAttribute("id", eleid);
      this.nextid++;
      this.elementLookup.set(eleid, this.listOfElements.length);
      this.listOfElements.push(this.selectedElement);
      guiGroup.appendChild(svgShape);
      this.workArea.appendChild(guiGroup);
      this.shouldCreate = true;
    }
    clearSelection() {
      const oldSelections = this.workArea.querySelectorAll(".resize-handle");
      for (let rmSel of oldSelections) {
        rmSel.remove();
      }
    }
    doSelectElement() {
      const svgGroup = this.selectedElement.getCorropspondingShape().parentNode;
      if (!svgGroup.querySelector(".resize-handle")) {
        const handles = this.selectedElement.getResizeHandles();
        for (let i = 0; i < handles.length; i++) {
          const border = Util.makeSVGElement("line");
          border.setAttribute("class", "resize-handle edge");
          border.setAttribute("x1", handles[i].x);
          border.setAttribute("y1", handles[i].y);
          border.setAttribute("x2", handles[(i + 1) % handles.length].x);
          border.setAttribute("y2", handles[(i + 1) % handles.length].y);
          svgGroup.appendChild(border);
        }
        for (let i = 0; i < handles.length; i++) {
          const corner = Util.makeSVGElement("circle");
          corner.setAttribute("class", "resize-handle corner");
          corner.setAttribute("cx", handles[i].x);
          corner.setAttribute("cy", handles[i].y);
          corner.setAttribute("r", 5);
          svgGroup.appendChild(corner);
        }
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
        if (!foundResizePos.left && !foundResizePos.right && !foundResizePos.top && !foundResizePos.bottom) {
          return false;
        }
        return foundResizePos;
      }
      return false;
    }
    positionalPress(ev, pos) {
      const checkResizeDir = this.checkInsisideResize(pos);
      if (checkResizeDir != false) {
        this.editor.setCurrentCommand("resize");
        this.resizeDirections = checkResizeDir;
        const shapeToResize = this.selectedElement.getCorropspondingShape();
        const resizePositionBox = shapeToResize.getBoundingClientRect();
        const resizeBoundingBox = shapeToResize.getBBox();
        const translateToParse = shapeToResize.parentNode.getAttribute("transform");
        const beforeTranslate = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(
          translateToParse
        );
        this.selectedElement.oldBBox = {
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
        console.log(this.selectedElement.oldBBox);
        return;
      }
      this.selectedElement = null;
      this.clearSelection();
      if (this.elementLookup.has(ev.target.id)) {
        this.selectedElement = this.listOfElements[this.elementLookup.get(ev.target.id)];
        this.doSelectElement();
        this.editor.setCurrentCommand("move");
      }
    }
    positionalMove(pos) {
      if (!this.selectedElement) {
        return;
      }
      const currentCommand = this.editor.getCurrentCommand();
      if (currentCommand == "create" || currentCommand == "move") {
        const shape = this.selectedElement.getCorropspondingShape().parentNode;
        shape.setAttribute("transform", "translate(" + pos.x + "," + pos.y + ")");
        if (this.shouldCreate) {
          this.shouldCreate = false;
          this.undoRedo.addHistory(new CreateCommand(
            this.selectedElement,
            this.workArea
          ));
        } else {
          this.undoRedo.addHistory(new ModifyCommand(
            this.selectedElement,
            this.selectedElement.attributes
          ));
        }
      } else if (currentCommand == "resize") {
        const shapeToResize = this.selectedElement.getCorropspondingShape();
        const oldBBox = this.selectedElement.oldBBox;
        const relativeResizePositionBox = {
          x: oldBBox.translateX,
          y: oldBBox.translateY,
          width: oldBBox.width,
          height: oldBBox.height
        };
        if (this.resizeDirections.top) {
          relativeResizePositionBox.height = oldBBox.height + oldBBox.absoluteY - pos.y;
          relativeResizePositionBox.y = pos.y + relativeResizePositionBox.height / 2;
        } else if (this.resizeDirections.bottom) {
        }
        if (this.resizeDirections.left) {
          relativeResizePositionBox.width = oldBBox.width + oldBBox.absoluteX - pos.x;
          relativeResizePositionBox.x = pos.x + relativeResizePositionBox.width / 2;
        } else if (this.resizeDirections.right) {
          relativeResizePositionBox.width = oldBBox.width + oldBBox.absoluteX - pos.x;
        }
        shapeToResize.parentNode.setAttribute("transform", "translate(" + relativeResizePositionBox.x + "," + relativeResizePositionBox.y + ")");
        this.selectedElement.resize(relativeResizePositionBox);
      } else {
        const shouldResize = this.checkInsisideResize(pos);
        this.editor.svgElement.classList.remove(
          "cur-rsnesw",
          "cur-rsnwse",
          "cur-rsns",
          "cur-rsew"
        );
        if (shouldResize != false) {
          if (shouldResize.left || shouldResize.right) {
            if (shouldResize.top) {
              if (shouldResize.right) {
                this.editor.svgElement.classList.add("cur-rsnesw");
              } else {
                this.editor.svgElement.classList.add("cur-rsnwse");
              }
            } else if (shouldResize.bottom) {
              if (shouldResize.right) {
                this.editor.svgElement.classList.add("cur-rsnwse");
              } else {
                this.editor.svgElement.classList.add("cur-rsnesw");
              }
            } else {
              this.editor.svgElement.classList.add("cur-rsew");
            }
          } else if (shouldResize.top || shouldResize.bottom) {
            this.editor.svgElement.classList.add("cur-rsns");
          }
        }
      }
    }
    positionalRelease() {
      if (!this.selectedElement) {
        return;
      }
      this.doSelectElement();
    }
  };

  // src/UndoRedo.js
  var UndoRedo = class {
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
  };

  // src/FlowchartEditor.js
  var FlowchartEditor = class {
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
      this.workArea = Util.makeSVGElement("g");
      this.svgElement.appendChild(this.workArea);
      this.UndoRedoObj = new UndoRedo(this);
      this.elementEditorObj = new ElementEditor(this, this.workArea, this.UndoRedoObj);
      this.eventList = [];
      this.eventList.push([
        this.settings.createBoxElement,
        "mousedown",
        this.handleEvent.bind(this)
      ]);
      this.eventList.push([document, "mousedown", this.handleEvent.bind(this)]);
      this.eventList.push([document, "mousemove", this.handleEvent.bind(this)]);
      this.eventList.push([document, "mouseup", this.handleEvent.bind(this)]);
      this.disable();
    }
    getCurrentCommand() {
      return this.currentCommand;
    }
    setCurrentCommand(setCommand) {
      this.currentCommand = setCommand;
    }
    handleEvent(ev) {
      if (ev.type == "mousedown") {
        if (ev.target.classList.contains("createbox-button")) {
          if (this.currentCommand != "create" && this.currentCommand != "move" && this.currentCommand != "resize") {
            this.currentCommand = "create";
            this.elementEditorObj.selectcreate(ev.target.dataset.shape);
          }
        } else {
          this.elementEditorObj.positionalPress(ev, new DOMPoint(ev.clientX, ev.clientY));
        }
      } else if (ev.type == "mousemove") {
        const pt = new DOMPoint(ev.clientX, ev.clientY);
        this.elementEditorObj.positionalMove(pt);
      } else if (ev.type == "mouseup") {
        this.currentCommand = "";
        this.elementEditorObj.positionalRelease();
      }
    }
    enable() {
      const createBox = this.settings.createBoxElement;
      const propertyBox = this.settings.propertyBoxElement;
      const toolbox = this.settings.toolboxElement;
      createBox.style.display = "unset";
      propertyBox.style.display = "unset";
      toolbox.style.display = "unset";
      for (let bev of this.eventList) {
        bev[0].addEventListener(bev[1], bev[2]);
      }
    }
    disable() {
      const createBox = this.settings.createBoxElement;
      const propertyBox = this.settings.propertyBoxElement;
      const toolbox = this.settings.toolboxElement;
      createBox.style.display = "none";
      propertyBox.style.display = "none";
      toolbox.style.display = "none";
      for (let bev of this.eventList) {
        bev[0].removeEventListener(bev[1], bev[2]);
      }
    }
  };
  return __toCommonJS(FlowchartEditor_exports);
})();
