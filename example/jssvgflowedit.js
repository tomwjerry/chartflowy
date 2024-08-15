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
    name;
    // What SVG shape this refers to, should be a direct reference
    corrospondingShape;
    corrospondingShapeID;
    // Arrary of all currently paths lines
    allConnections;
    // Store our orginal position
    oldBBox;
    oldAttributes;
    oldContainerAttributes;
    constructor() {
      this.allConnections = [];
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
      this.name = "EllipseShape";
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
      this.name = "RectangleShape";
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
      this.name = " RhombShape";
      this.corrospondingShape = Util.makeSVGElement("path");
      this.corrospondingShape.setAttribute("d", "M 0  " + -(attr.height / 2) + " L " + attr.width / 2 + " 0 L 0 " + attr.height / 2 + " L " + -(attr.width / 2) + " 0 z");
    }
    resize(newSize) {
      this.corrospondingShape.setAttribute("d", "M 0  " + -(newSize.height / 2) + " L " + newSize.width / 2 + " 0 L 0 " + newSize.height / 2 + " L " + -(newSize.width / 2) + " 0 z");
    }
  };

  // src/Shapes/ConnectionLine.js
  var ConnectionLine = class extends BaseShape {
    constructor(attr) {
      super();
      this.name = "ConnectionLine";
      this.corrospondingShape = Util.makeSVGElement("path");
    }
    resize(newSize) {
    }
  };

  // node_modules/path-data-polyfill/path-data-polyfill.js
  if (!SVGPathElement.prototype.getPathData || !SVGPathElement.prototype.setPathData) {
    (function() {
      var commandsMap = {
        "Z": "Z",
        "M": "M",
        "L": "L",
        "C": "C",
        "Q": "Q",
        "A": "A",
        "H": "H",
        "V": "V",
        "S": "S",
        "T": "T",
        "z": "Z",
        "m": "m",
        "l": "l",
        "c": "c",
        "q": "q",
        "a": "a",
        "h": "h",
        "v": "v",
        "s": "s",
        "t": "t"
      };
      var Source = function(string) {
        this._string = string;
        this._currentIndex = 0;
        this._endIndex = this._string.length;
        this._prevCommand = null;
        this._skipOptionalSpaces();
      };
      var isIE = window.navigator.userAgent.indexOf("MSIE ") !== -1;
      Source.prototype = {
        parseSegment: function() {
          var char = this._string[this._currentIndex];
          var command = commandsMap[char] ? commandsMap[char] : null;
          if (command === null) {
            if (this._prevCommand === null) {
              return null;
            }
            if ((char === "+" || char === "-" || char === "." || char >= "0" && char <= "9") && this._prevCommand !== "Z") {
              if (this._prevCommand === "M") {
                command = "L";
              } else if (this._prevCommand === "m") {
                command = "l";
              } else {
                command = this._prevCommand;
              }
            } else {
              command = null;
            }
            if (command === null) {
              return null;
            }
          } else {
            this._currentIndex += 1;
          }
          this._prevCommand = command;
          var values = null;
          var cmd = command.toUpperCase();
          if (cmd === "H" || cmd === "V") {
            values = [this._parseNumber()];
          } else if (cmd === "M" || cmd === "L" || cmd === "T") {
            values = [this._parseNumber(), this._parseNumber()];
          } else if (cmd === "S" || cmd === "Q") {
            values = [this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseNumber()];
          } else if (cmd === "C") {
            values = [
              this._parseNumber(),
              this._parseNumber(),
              this._parseNumber(),
              this._parseNumber(),
              this._parseNumber(),
              this._parseNumber()
            ];
          } else if (cmd === "A") {
            values = [
              this._parseNumber(),
              this._parseNumber(),
              this._parseNumber(),
              this._parseArcFlag(),
              this._parseArcFlag(),
              this._parseNumber(),
              this._parseNumber()
            ];
          } else if (cmd === "Z") {
            this._skipOptionalSpaces();
            values = [];
          }
          if (values === null || values.indexOf(null) >= 0) {
            return null;
          } else {
            return { type: command, values };
          }
        },
        hasMoreData: function() {
          return this._currentIndex < this._endIndex;
        },
        peekSegmentType: function() {
          var char = this._string[this._currentIndex];
          return commandsMap[char] ? commandsMap[char] : null;
        },
        initialCommandIsMoveTo: function() {
          if (!this.hasMoreData()) {
            return true;
          }
          var command = this.peekSegmentType();
          return command === "M" || command === "m";
        },
        _isCurrentSpace: function() {
          var char = this._string[this._currentIndex];
          return char <= " " && (char === " " || char === "\n" || char === "	" || char === "\r" || char === "\f");
        },
        _skipOptionalSpaces: function() {
          while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
            this._currentIndex += 1;
          }
          return this._currentIndex < this._endIndex;
        },
        _skipOptionalSpacesOrDelimiter: function() {
          if (this._currentIndex < this._endIndex && !this._isCurrentSpace() && this._string[this._currentIndex] !== ",") {
            return false;
          }
          if (this._skipOptionalSpaces()) {
            if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ",") {
              this._currentIndex += 1;
              this._skipOptionalSpaces();
            }
          }
          return this._currentIndex < this._endIndex;
        },
        // Parse a number from an SVG path. This very closely follows genericParseNumber(...) from
        // Source/core/svg/SVGParserUtilities.cpp.
        // Spec: http://www.w3.org/TR/SVG11/single-page.html#paths-PathDataBNF
        _parseNumber: function() {
          var exponent = 0;
          var integer = 0;
          var frac = 1;
          var decimal = 0;
          var sign = 1;
          var expsign = 1;
          var startIndex = this._currentIndex;
          this._skipOptionalSpaces();
          if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "+") {
            this._currentIndex += 1;
          } else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "-") {
            this._currentIndex += 1;
            sign = -1;
          }
          if (this._currentIndex === this._endIndex || (this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") && this._string[this._currentIndex] !== ".") {
            return null;
          }
          var startIntPartIndex = this._currentIndex;
          while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9") {
            this._currentIndex += 1;
          }
          if (this._currentIndex !== startIntPartIndex) {
            var scanIntPartIndex = this._currentIndex - 1;
            var multiplier = 1;
            while (scanIntPartIndex >= startIntPartIndex) {
              integer += multiplier * (this._string[scanIntPartIndex] - "0");
              scanIntPartIndex -= 1;
              multiplier *= 10;
            }
          }
          if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ".") {
            this._currentIndex += 1;
            if (this._currentIndex >= this._endIndex || this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") {
              return null;
            }
            while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9") {
              frac *= 10;
              decimal += (this._string.charAt(this._currentIndex) - "0") / frac;
              this._currentIndex += 1;
            }
          }
          if (this._currentIndex !== startIndex && this._currentIndex + 1 < this._endIndex && (this._string[this._currentIndex] === "e" || this._string[this._currentIndex] === "E") && (this._string[this._currentIndex + 1] !== "x" && this._string[this._currentIndex + 1] !== "m")) {
            this._currentIndex += 1;
            if (this._string[this._currentIndex] === "+") {
              this._currentIndex += 1;
            } else if (this._string[this._currentIndex] === "-") {
              this._currentIndex += 1;
              expsign = -1;
            }
            if (this._currentIndex >= this._endIndex || this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") {
              return null;
            }
            while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9") {
              exponent *= 10;
              exponent += this._string[this._currentIndex] - "0";
              this._currentIndex += 1;
            }
          }
          var number = integer + decimal;
          number *= sign;
          if (exponent) {
            number *= Math.pow(10, expsign * exponent);
          }
          if (startIndex === this._currentIndex) {
            return null;
          }
          this._skipOptionalSpacesOrDelimiter();
          return number;
        },
        _parseArcFlag: function() {
          if (this._currentIndex >= this._endIndex) {
            return null;
          }
          var flag = null;
          var flagChar = this._string[this._currentIndex];
          this._currentIndex += 1;
          if (flagChar === "0") {
            flag = 0;
          } else if (flagChar === "1") {
            flag = 1;
          } else {
            return null;
          }
          this._skipOptionalSpacesOrDelimiter();
          return flag;
        }
      };
      var parsePathDataString = function(string) {
        if (!string || string.length === 0)
          return [];
        var source = new Source(string);
        var pathData = [];
        if (source.initialCommandIsMoveTo()) {
          while (source.hasMoreData()) {
            var pathSeg = source.parseSegment();
            if (pathSeg === null) {
              break;
            } else {
              pathData.push(pathSeg);
            }
          }
        }
        return pathData;
      };
      var setAttribute = SVGPathElement.prototype.setAttribute;
      var setAttributeNS = SVGPathElement.prototype.setAttributeNS;
      var removeAttribute = SVGPathElement.prototype.removeAttribute;
      var removeAttributeNS = SVGPathElement.prototype.removeAttributeNS;
      var $cachedPathData = window.Symbol ? Symbol() : "__cachedPathData";
      var $cachedNormalizedPathData = window.Symbol ? Symbol() : "__cachedNormalizedPathData";
      var arcToCubicCurves = function(x1, y1, x2, y2, r1, r2, angle, largeArcFlag, sweepFlag, _recursive) {
        var degToRad = function(degrees) {
          return Math.PI * degrees / 180;
        };
        var rotate = function(x3, y3, angleRad2) {
          var X = x3 * Math.cos(angleRad2) - y3 * Math.sin(angleRad2);
          var Y = x3 * Math.sin(angleRad2) + y3 * Math.cos(angleRad2);
          return { x: X, y: Y };
        };
        var angleRad = degToRad(angle);
        var params = [];
        var f1, f2, cx, cy;
        if (_recursive) {
          f1 = _recursive[0];
          f2 = _recursive[1];
          cx = _recursive[2];
          cy = _recursive[3];
        } else {
          var p1 = rotate(x1, y1, -angleRad);
          x1 = p1.x;
          y1 = p1.y;
          var p2 = rotate(x2, y2, -angleRad);
          x2 = p2.x;
          y2 = p2.y;
          var x = (x1 - x2) / 2;
          var y = (y1 - y2) / 2;
          var h = x * x / (r1 * r1) + y * y / (r2 * r2);
          if (h > 1) {
            h = Math.sqrt(h);
            r1 = h * r1;
            r2 = h * r2;
          }
          var sign;
          if (largeArcFlag === sweepFlag) {
            sign = -1;
          } else {
            sign = 1;
          }
          var r1Pow = r1 * r1;
          var r2Pow = r2 * r2;
          var left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
          var right = r1Pow * y * y + r2Pow * x * x;
          var k = sign * Math.sqrt(Math.abs(left / right));
          cx = k * r1 * y / r2 + (x1 + x2) / 2;
          cy = k * -r2 * x / r1 + (y1 + y2) / 2;
          f1 = Math.asin(parseFloat(((y1 - cy) / r2).toFixed(9)));
          f2 = Math.asin(parseFloat(((y2 - cy) / r2).toFixed(9)));
          if (x1 < cx) {
            f1 = Math.PI - f1;
          }
          if (x2 < cx) {
            f2 = Math.PI - f2;
          }
          if (f1 < 0) {
            f1 = Math.PI * 2 + f1;
          }
          if (f2 < 0) {
            f2 = Math.PI * 2 + f2;
          }
          if (sweepFlag && f1 > f2) {
            f1 = f1 - Math.PI * 2;
          }
          if (!sweepFlag && f2 > f1) {
            f2 = f2 - Math.PI * 2;
          }
        }
        var df = f2 - f1;
        if (Math.abs(df) > Math.PI * 120 / 180) {
          var f2old = f2;
          var x2old = x2;
          var y2old = y2;
          if (sweepFlag && f2 > f1) {
            f2 = f1 + Math.PI * 120 / 180 * 1;
          } else {
            f2 = f1 + Math.PI * 120 / 180 * -1;
          }
          x2 = cx + r1 * Math.cos(f2);
          y2 = cy + r2 * Math.sin(f2);
          params = arcToCubicCurves(x2, y2, x2old, y2old, r1, r2, angle, 0, sweepFlag, [f2, f2old, cx, cy]);
        }
        df = f2 - f1;
        var c1 = Math.cos(f1);
        var s1 = Math.sin(f1);
        var c2 = Math.cos(f2);
        var s2 = Math.sin(f2);
        var t = Math.tan(df / 4);
        var hx = 4 / 3 * r1 * t;
        var hy = 4 / 3 * r2 * t;
        var m1 = [x1, y1];
        var m2 = [x1 + hx * s1, y1 - hy * c1];
        var m3 = [x2 + hx * s2, y2 - hy * c2];
        var m4 = [x2, y2];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if (_recursive) {
          return [m2, m3, m4].concat(params);
        } else {
          params = [m2, m3, m4].concat(params);
          var curves = [];
          for (var i = 0; i < params.length; i += 3) {
            var r1 = rotate(params[i][0], params[i][1], angleRad);
            var r2 = rotate(params[i + 1][0], params[i + 1][1], angleRad);
            var r3 = rotate(params[i + 2][0], params[i + 2][1], angleRad);
            curves.push([r1.x, r1.y, r2.x, r2.y, r3.x, r3.y]);
          }
          return curves;
        }
      };
      var clonePathData = function(pathData) {
        return pathData.map(function(seg) {
          return { type: seg.type, values: Array.prototype.slice.call(seg.values) };
        });
      };
      var absolutizePathData = function(pathData) {
        var absolutizedPathData = [];
        var currentX = null;
        var currentY = null;
        var subpathX = null;
        var subpathY = null;
        pathData.forEach(function(seg) {
          var type = seg.type;
          if (type === "M") {
            var x = seg.values[0];
            var y = seg.values[1];
            absolutizedPathData.push({ type: "M", values: [x, y] });
            subpathX = x;
            subpathY = y;
            currentX = x;
            currentY = y;
          } else if (type === "m") {
            var x = currentX + seg.values[0];
            var y = currentY + seg.values[1];
            absolutizedPathData.push({ type: "M", values: [x, y] });
            subpathX = x;
            subpathY = y;
            currentX = x;
            currentY = y;
          } else if (type === "L") {
            var x = seg.values[0];
            var y = seg.values[1];
            absolutizedPathData.push({ type: "L", values: [x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "l") {
            var x = currentX + seg.values[0];
            var y = currentY + seg.values[1];
            absolutizedPathData.push({ type: "L", values: [x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "C") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x2 = seg.values[2];
            var y2 = seg.values[3];
            var x = seg.values[4];
            var y = seg.values[5];
            absolutizedPathData.push({ type: "C", values: [x1, y1, x2, y2, x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "c") {
            var x1 = currentX + seg.values[0];
            var y1 = currentY + seg.values[1];
            var x2 = currentX + seg.values[2];
            var y2 = currentY + seg.values[3];
            var x = currentX + seg.values[4];
            var y = currentY + seg.values[5];
            absolutizedPathData.push({ type: "C", values: [x1, y1, x2, y2, x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "Q") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            absolutizedPathData.push({ type: "Q", values: [x1, y1, x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "q") {
            var x1 = currentX + seg.values[0];
            var y1 = currentY + seg.values[1];
            var x = currentX + seg.values[2];
            var y = currentY + seg.values[3];
            absolutizedPathData.push({ type: "Q", values: [x1, y1, x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "A") {
            var x = seg.values[5];
            var y = seg.values[6];
            absolutizedPathData.push({
              type: "A",
              values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
            });
            currentX = x;
            currentY = y;
          } else if (type === "a") {
            var x = currentX + seg.values[5];
            var y = currentY + seg.values[6];
            absolutizedPathData.push({
              type: "A",
              values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
            });
            currentX = x;
            currentY = y;
          } else if (type === "H") {
            var x = seg.values[0];
            absolutizedPathData.push({ type: "H", values: [x] });
            currentX = x;
          } else if (type === "h") {
            var x = currentX + seg.values[0];
            absolutizedPathData.push({ type: "H", values: [x] });
            currentX = x;
          } else if (type === "V") {
            var y = seg.values[0];
            absolutizedPathData.push({ type: "V", values: [y] });
            currentY = y;
          } else if (type === "v") {
            var y = currentY + seg.values[0];
            absolutizedPathData.push({ type: "V", values: [y] });
            currentY = y;
          } else if (type === "S") {
            var x2 = seg.values[0];
            var y2 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            absolutizedPathData.push({ type: "S", values: [x2, y2, x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "s") {
            var x2 = currentX + seg.values[0];
            var y2 = currentY + seg.values[1];
            var x = currentX + seg.values[2];
            var y = currentY + seg.values[3];
            absolutizedPathData.push({ type: "S", values: [x2, y2, x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "T") {
            var x = seg.values[0];
            var y = seg.values[1];
            absolutizedPathData.push({ type: "T", values: [x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "t") {
            var x = currentX + seg.values[0];
            var y = currentY + seg.values[1];
            absolutizedPathData.push({ type: "T", values: [x, y] });
            currentX = x;
            currentY = y;
          } else if (type === "Z" || type === "z") {
            absolutizedPathData.push({ type: "Z", values: [] });
            currentX = subpathX;
            currentY = subpathY;
          }
        });
        return absolutizedPathData;
      };
      var reducePathData = function(pathData) {
        var reducedPathData = [];
        var lastType = null;
        var lastControlX = null;
        var lastControlY = null;
        var currentX = null;
        var currentY = null;
        var subpathX = null;
        var subpathY = null;
        pathData.forEach(function(seg) {
          if (seg.type === "M") {
            var x = seg.values[0];
            var y = seg.values[1];
            reducedPathData.push({ type: "M", values: [x, y] });
            subpathX = x;
            subpathY = y;
            currentX = x;
            currentY = y;
          } else if (seg.type === "C") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x2 = seg.values[2];
            var y2 = seg.values[3];
            var x = seg.values[4];
            var y = seg.values[5];
            reducedPathData.push({ type: "C", values: [x1, y1, x2, y2, x, y] });
            lastControlX = x2;
            lastControlY = y2;
            currentX = x;
            currentY = y;
          } else if (seg.type === "L") {
            var x = seg.values[0];
            var y = seg.values[1];
            reducedPathData.push({ type: "L", values: [x, y] });
            currentX = x;
            currentY = y;
          } else if (seg.type === "H") {
            var x = seg.values[0];
            reducedPathData.push({ type: "L", values: [x, currentY] });
            currentX = x;
          } else if (seg.type === "V") {
            var y = seg.values[0];
            reducedPathData.push({ type: "L", values: [currentX, y] });
            currentY = y;
          } else if (seg.type === "S") {
            var x2 = seg.values[0];
            var y2 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            var cx1, cy1;
            if (lastType === "C" || lastType === "S") {
              cx1 = currentX + (currentX - lastControlX);
              cy1 = currentY + (currentY - lastControlY);
            } else {
              cx1 = currentX;
              cy1 = currentY;
            }
            reducedPathData.push({ type: "C", values: [cx1, cy1, x2, y2, x, y] });
            lastControlX = x2;
            lastControlY = y2;
            currentX = x;
            currentY = y;
          } else if (seg.type === "T") {
            var x = seg.values[0];
            var y = seg.values[1];
            var x1, y1;
            if (lastType === "Q" || lastType === "T") {
              x1 = currentX + (currentX - lastControlX);
              y1 = currentY + (currentY - lastControlY);
            } else {
              x1 = currentX;
              y1 = currentY;
            }
            var cx1 = currentX + 2 * (x1 - currentX) / 3;
            var cy1 = currentY + 2 * (y1 - currentY) / 3;
            var cx2 = x + 2 * (x1 - x) / 3;
            var cy2 = y + 2 * (y1 - y) / 3;
            reducedPathData.push({ type: "C", values: [cx1, cy1, cx2, cy2, x, y] });
            lastControlX = x1;
            lastControlY = y1;
            currentX = x;
            currentY = y;
          } else if (seg.type === "Q") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            var cx1 = currentX + 2 * (x1 - currentX) / 3;
            var cy1 = currentY + 2 * (y1 - currentY) / 3;
            var cx2 = x + 2 * (x1 - x) / 3;
            var cy2 = y + 2 * (y1 - y) / 3;
            reducedPathData.push({ type: "C", values: [cx1, cy1, cx2, cy2, x, y] });
            lastControlX = x1;
            lastControlY = y1;
            currentX = x;
            currentY = y;
          } else if (seg.type === "A") {
            var r1 = Math.abs(seg.values[0]);
            var r2 = Math.abs(seg.values[1]);
            var angle = seg.values[2];
            var largeArcFlag = seg.values[3];
            var sweepFlag = seg.values[4];
            var x = seg.values[5];
            var y = seg.values[6];
            if (r1 === 0 || r2 === 0) {
              reducedPathData.push({ type: "C", values: [currentX, currentY, x, y, x, y] });
              currentX = x;
              currentY = y;
            } else {
              if (currentX !== x || currentY !== y) {
                var curves = arcToCubicCurves(currentX, currentY, x, y, r1, r2, angle, largeArcFlag, sweepFlag);
                curves.forEach(function(curve) {
                  reducedPathData.push({ type: "C", values: curve });
                });
                currentX = x;
                currentY = y;
              }
            }
          } else if (seg.type === "Z") {
            reducedPathData.push(seg);
            currentX = subpathX;
            currentY = subpathY;
          }
          lastType = seg.type;
        });
        return reducedPathData;
      };
      SVGPathElement.prototype.setAttribute = function(name, value) {
        if (name === "d") {
          this[$cachedPathData] = null;
          this[$cachedNormalizedPathData] = null;
        }
        setAttribute.call(this, name, value);
      };
      SVGPathElement.prototype.setAttributeNS = function(namespace, name, value) {
        if (name === "d") {
          var namespaceURI = "http://www.w3.org/2000/svg";
          if (namespace) {
            for (var attribute of this.ownerSVGElement.attributes) {
              if (attribute.name === `xmlns:${namespace}`) {
                namespaceURI = attribute.value;
              }
            }
          }
          if (namespaceURI === "http://www.w3.org/2000/svg") {
            this[$cachedPathData] = null;
            this[$cachedNormalizedPathData] = null;
          }
        }
        setAttributeNS.call(this, namespace, name, value);
      };
      SVGPathElement.prototype.removeAttribute = function(name, value) {
        if (name === "d") {
          this[$cachedPathData] = null;
          this[$cachedNormalizedPathData] = null;
        }
        removeAttribute.call(this, name);
      };
      SVGPathElement.prototype.removeAttributeNS = function(namespace, name) {
        if (name === "d") {
          var namespaceURI = "http://www.w3.org/2000/svg";
          if (namespace) {
            for (var attribute of this.ownerSVGElement.attributes) {
              if (attribute.name === `xmlns:${namespace}`) {
                namespaceURI = attribute.value;
              }
            }
          }
          if (namespaceURI === "http://www.w3.org/2000/svg") {
            this[$cachedPathData] = null;
            this[$cachedNormalizedPathData] = null;
          }
        }
        removeAttributeNS.call(this, namespace, name);
      };
      SVGPathElement.prototype.getPathData = function(options) {
        if (options && options.normalize) {
          if (this[$cachedNormalizedPathData]) {
            return clonePathData(this[$cachedNormalizedPathData]);
          } else {
            var pathData;
            if (this[$cachedPathData]) {
              pathData = clonePathData(this[$cachedPathData]);
            } else {
              pathData = parsePathDataString(this.getAttribute("d") || "");
              this[$cachedPathData] = clonePathData(pathData);
            }
            var normalizedPathData = reducePathData(absolutizePathData(pathData));
            this[$cachedNormalizedPathData] = clonePathData(normalizedPathData);
            return normalizedPathData;
          }
        } else {
          if (this[$cachedPathData]) {
            return clonePathData(this[$cachedPathData]);
          } else {
            var pathData = parsePathDataString(this.getAttribute("d") || "");
            this[$cachedPathData] = clonePathData(pathData);
            return pathData;
          }
        }
      };
      SVGPathElement.prototype.setPathData = function(pathData) {
        if (pathData.length === 0) {
          if (isIE) {
            this.setAttribute("d", "");
          } else {
            this.removeAttribute("d");
          }
        } else {
          var d = "";
          for (var i = 0, l = pathData.length; i < l; i += 1) {
            var seg = pathData[i];
            if (i > 0) {
              d += " ";
            }
            d += seg.type;
            if (seg.values && seg.values.length > 0) {
              d += " " + seg.values.join(" ");
            }
          }
          this.setAttribute("d", d);
        }
      };
      SVGRectElement.prototype.getPathData = function(options) {
        var x = this.x.baseVal.value;
        var y = this.y.baseVal.value;
        var width = this.width.baseVal.value;
        var height = this.height.baseVal.value;
        var rx = this.hasAttribute("rx") ? this.rx.baseVal.value : this.ry.baseVal.value;
        var ry = this.hasAttribute("ry") ? this.ry.baseVal.value : this.rx.baseVal.value;
        if (rx > width / 2) {
          rx = width / 2;
        }
        if (ry > height / 2) {
          ry = height / 2;
        }
        var pathData = [
          { type: "M", values: [x + rx, y] },
          { type: "H", values: [x + width - rx] },
          { type: "A", values: [rx, ry, 0, 0, 1, x + width, y + ry] },
          { type: "V", values: [y + height - ry] },
          { type: "A", values: [rx, ry, 0, 0, 1, x + width - rx, y + height] },
          { type: "H", values: [x + rx] },
          { type: "A", values: [rx, ry, 0, 0, 1, x, y + height - ry] },
          { type: "V", values: [y + ry] },
          { type: "A", values: [rx, ry, 0, 0, 1, x + rx, y] },
          { type: "Z", values: [] }
        ];
        pathData = pathData.filter(function(s) {
          return s.type === "A" && (s.values[0] === 0 || s.values[1] === 0) ? false : true;
        });
        if (options && options.normalize === true) {
          pathData = reducePathData(pathData);
        }
        return pathData;
      };
      SVGCircleElement.prototype.getPathData = function(options) {
        var cx = this.cx.baseVal.value;
        var cy = this.cy.baseVal.value;
        var r = this.r.baseVal.value;
        var pathData = [
          { type: "M", values: [cx + r, cy] },
          { type: "A", values: [r, r, 0, 0, 1, cx, cy + r] },
          { type: "A", values: [r, r, 0, 0, 1, cx - r, cy] },
          { type: "A", values: [r, r, 0, 0, 1, cx, cy - r] },
          { type: "A", values: [r, r, 0, 0, 1, cx + r, cy] },
          { type: "Z", values: [] }
        ];
        if (options && options.normalize === true) {
          pathData = reducePathData(pathData);
        }
        return pathData;
      };
      SVGEllipseElement.prototype.getPathData = function(options) {
        var cx = this.cx.baseVal.value;
        var cy = this.cy.baseVal.value;
        var rx = this.rx.baseVal.value;
        var ry = this.ry.baseVal.value;
        var pathData = [
          { type: "M", values: [cx + rx, cy] },
          { type: "A", values: [rx, ry, 0, 0, 1, cx, cy + ry] },
          { type: "A", values: [rx, ry, 0, 0, 1, cx - rx, cy] },
          { type: "A", values: [rx, ry, 0, 0, 1, cx, cy - ry] },
          { type: "A", values: [rx, ry, 0, 0, 1, cx + rx, cy] },
          { type: "Z", values: [] }
        ];
        if (options && options.normalize === true) {
          pathData = reducePathData(pathData);
        }
        return pathData;
      };
      SVGLineElement.prototype.getPathData = function() {
        return [
          { type: "M", values: [this.x1.baseVal.value, this.y1.baseVal.value] },
          { type: "L", values: [this.x2.baseVal.value, this.y2.baseVal.value] }
        ];
      };
      SVGPolylineElement.prototype.getPathData = function() {
        var pathData = [];
        for (var i = 0; i < this.points.numberOfItems; i += 1) {
          var point = this.points.getItem(i);
          pathData.push({
            type: i === 0 ? "M" : "L",
            values: [point.x, point.y]
          });
        }
        return pathData;
      };
      SVGPolygonElement.prototype.getPathData = function() {
        var pathData = [];
        for (var i = 0; i < this.points.numberOfItems; i += 1) {
          var point = this.points.getItem(i);
          pathData.push({
            type: i === 0 ? "M" : "L",
            values: [point.x, point.y]
          });
        }
        pathData.push({
          type: "Z",
          values: []
        });
        return pathData;
      };
    })();
  }

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
    checkChange() {
      return true;
    }
  };
  var ModifyCommand = class extends BaseCommand {
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
  };

  // src/ElementEditor.js
  var ElementEditor = class {
    editor;
    workArea;
    undoRedo;
    shouldCreate;
    resizeDirections;
    lineHandleManipulate;
    connectorSnapping;
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
      this.connectorSnapping = {
        canSnap: false,
        snapShapeId: null,
        snapTo: null
      };
      this.lineHandleManipulate = 0;
      this.elementLookup = /* @__PURE__ */ new Map();
      this.nextid = 0;
    }
    /**
     * Creates shape
     * @param {string} datashape 
     */
    selectcreate(datashape) {
      if (this.selectedElement) {
        this.selectedElement.getCorropspondingShape().parentNode.classList.remove("selected");
      }
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
        case "connectionline":
          this.selectedElement = new ConnectionLine({ width: 60, height: 60 });
          break;
        default:
          break;
      }
      const guiGroup = Util.makeSVGElement("g");
      guiGroup.setAttribute("class", "gui");
      const svgShape = this.selectedElement.getCorropspondingShape();
      const eleid = "fce_" + this.nextid;
      svgShape.setAttribute("stroke", "#000000");
      svgShape.setAttribute("fill", "#ffffff");
      svgShape.setAttribute("id", eleid);
      guiGroup.appendChild(svgShape);
      this.workArea.appendChild(guiGroup);
      this.selectedElement.corrospondingShapeID = eleid;
      this.elementLookup.set(eleid, this.listOfElements.length);
      this.listOfElements.push(this.selectedElement);
      this.shouldCreate = true;
      this.nextid++;
    }
    /**
     * Selects element, yeah the element is already selected so draw some borders
     * around it. Make resize handles.
     */
    doSelectElement() {
      const corshape = this.selectedElement.getCorropspondingShape();
      const svgGroup = corshape.parentNode;
      svgGroup.classList.add("selected");
      if (svgGroup.querySelector(".resize-handle, .line-modify-handle")) {
        return;
      }
      if (this.selectedElement.name == "ConnectionLine") {
        const pathpoints = corshape.getPathData();
        for (let i = 0; i < pathpoints.length; i++) {
          const conhandle = Util.makeSVGElement("circle");
          conhandle.dataset.pathIndex = i;
          if (i == pathpoints.length - 1) {
            conhandle.dataset.pathIsLast = true;
          }
          conhandle.setAttribute("class", "line-modify-handle");
          conhandle.setAttribute("cx", pathpoints[i].values[0]);
          conhandle.setAttribute("cy", pathpoints[i].values[1]);
          conhandle.setAttribute("r", 5);
          svgGroup.appendChild(conhandle);
        }
        return;
      }
      const boundingBox = corshape.getBBox();
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
      for (let i = 0; i < handles.length; i++) {
        const border = Util.makeSVGElement("line");
        const x2 = handles[(i + 1) % handles.length].x;
        const y2 = handles[(i + 1) % handles.length].y;
        border.setAttribute("class", "resize-handle edge");
        border.setAttribute("x1", handles[i].x);
        border.setAttribute("y1", handles[i].y);
        border.setAttribute("x2", x2);
        border.setAttribute("y2", y2);
        svgGroup.appendChild(border);
        let conhandle = Util.makeSVGElement("circle");
        conhandle.setAttribute("class", "connector");
        conhandle.setAttribute("cx", handles[i].cx);
        conhandle.setAttribute("cy", handles[i].cy);
        conhandle.setAttribute("r", 5);
        svgGroup.appendChild(conhandle);
        conhandle = Util.makeSVGElement("circle");
        conhandle.setAttribute("class", "connection-suggestion");
        conhandle.id = corshape.id + "_close_" + i;
        conhandle.setAttribute("cx", handles[i].closecx);
        conhandle.setAttribute("cy", handles[i].closecy);
        conhandle.setAttribute("r", 5);
        svgGroup.appendChild(conhandle);
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
    /**
     * Put text in shape
     */
    setSelectedElementText() {
      const enteredText = this.editor.svgElement.parentNode.querySelector(".svgtexteditor");
      if (!enteredText) {
        return;
      }
      if (this.selectedElement) {
        const selPar = this.selectedElement.getCorropspondingShape().parentNode;
        let textElement = selPar.querySelector("text");
        if (textElement) {
          textElement.textContent = "";
        } else {
          textElement = Util.makeSVGElement("text");
          textElement.setAttribute("text-anchor", "middle");
          selPar.appendChild(textElement);
        }
        const textLines = enteredText.querySelector(".input").innerText.split("\n");
        for (let i = 0; i < textLines.length; i++) {
          const textrow = Util.makeSVGElement("tspan");
          textrow.setAttribute("dy", (i > 0 ? 1 : 0.41) + "em");
          textrow.setAttribute("x", 0);
          textrow.textContent = textLines[i];
          textElement.appendChild(textrow);
        }
        textElement.setAttribute("y", 1 - textLines.length / 2 + "em");
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
      let shapeArray = [[], []];
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
      const shapeToResize = shape.getCorropspondingShape();
      const resizePositionBox = shapeToResize.getBoundingClientRect();
      const resizeBoundingBox = shapeToResize.getBBox();
      const translateToParse = shapeToResize.parentNode.getAttribute("transform");
      const beforeTranslate = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(
        translateToParse
      );
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
      if (this.selectedElement) {
        const attrs = this.getElementAttributes(this.selectedElement);
        this.selectedElement.oldAttributes = attrs[0];
        this.selectedElement.oldContainerAttributes = attrs[1];
      }
      if (ev.target.classList.contains("line-modify-handle")) {
        this.editor.setCurrentCommand("connect");
        this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
        this.lineHandleManipulate = ev.target.dataset.pathIndex;
        this.connectorSnapping.canSnap = ev.target.dataset.pathIndex == 0 || this.selectedElement.getCorropspondingShape().dataset.pathIsLast;
        return;
      }
      const checkResizeDir = this.checkInsisideResize(pos);
      if (checkResizeDir != false) {
        this.setSelectedElementText();
        this.editor.setCurrentCommand("resize");
        this.resizeDirections = checkResizeDir;
        this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
        return;
      }
      if (ev.target.classList.contains("connector")) {
        const connector = ev.target;
        const connectorPos = connector.getBoundingClientRect();
        const oldSelShape = this.listOfElements[this.elementLookup.get(
          this.selectedElement.corrospondingShapeID
        )];
        this.selectcreate("connectionline");
        oldSelShape.allConnections.push({
          id: this.selectedElement.corrospondingShapeID,
          point: 0
        });
        const connectorline = this.selectedElement.getCorropspondingShape();
        const connectorlineContainer = connectorline.parentNode;
        const cx = parseInt(connector.getAttribute("cx"));
        const cy = parseInt(connector.getAttribute("cy"));
        if (cx != 0) {
          connectorPos.x += cx > 0 ? -10 : 20;
          connectorPos.y += 5;
        }
        if (cy != 0) {
          connectorPos.y += cy > 0 ? -10 : 20;
          connectorPos.x += 10;
        }
        connectorline.setAttribute("d", "M 0 0 L 0 0");
        connectorlineContainer.setAttribute("transform", "translate(" + connectorPos.x + "," + connectorPos.y + ")");
        this.selectedElement.oldBBox = this.getAllElementBounds(this.selectedElement);
        this.editor.setCurrentCommand("connect");
        this.lineHandleManipulate = 1;
        this.connectorSnapping.canSnap = true;
        return;
      }
      this.setSelectedElementText();
      const oldSelected = this.selectedElement;
      if (oldSelected) {
        oldSelected.getCorropspondingShape().parentNode.classList.remove("selected");
      }
      this.selectedElement = null;
      if (this.elementLookup.has(ev.target.id)) {
        this.selectedElement = this.listOfElements[this.elementLookup.get(ev.target.id)];
        this.doSelectElement();
        this.editor.setCurrentCommand("move");
        const attrs = this.getElementAttributes(this.selectedElement);
        this.selectedElement.oldAttributes = attrs[0];
        this.selectedElement.oldContainerAttributes = attrs[1];
      }
      if (oldSelected && oldSelected == this.selectedElement) {
        let textEdit = this.editor.svgElement.parentNode.querySelector(".svgtexteditor");
        if (textEdit) {
          if (textEdit.dataset.currentEdit != oldSelected.corrospondingShapeID) {
            textEdit.remove();
            textEdit = false;
          }
        }
        if (!textEdit) {
          textEdit = document.createElement("div");
          textEdit.className = "svgtexteditor";
          const corshape = this.selectedElement.getCorropspondingShape();
          const shapeCentre = corshape.getBoundingClientRect();
          textEdit.style.left = shapeCentre.x + "px";
          textEdit.style.top = shapeCentre.y + "px";
          const inputInner = document.createElement("div");
          inputInner.contentEditable = true;
          inputInner.className = "input";
          inputInner.style.width = shapeCentre.width + "px";
          inputInner.style.height = shapeCentre.height + "px";
          const textele = corshape.parentNode.querySelector("text");
          if (textele) {
            const textspans = textele.querySelectorAll("tspan");
            for (let i = 0; i < textspans.length; i++) {
              if (i > 0) {
                inputInner.innerHTML += "<br>";
              }
              inputInner.innerHTML += textspans[i].textContent;
            }
            textele.textContent = "";
          }
          textEdit.appendChild(inputInner);
          this.editor.svgElement.parentNode.appendChild(textEdit);
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
      if (currentCommand == "create" || currentCommand == "move") {
        const shape = this.selectedElement.getCorropspondingShape().parentNode;
        shape.setAttribute("transform", "translate(" + pos.x + "," + pos.y + ")");
        if (this.shouldCreate) {
          this.shouldCreate = false;
          this.undoRedo.addHistory(new CreateCommand(
            shape,
            this.workArea
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
          relativeResizePositionBox.height = pos.y - oldBBox.absoluteY;
          relativeResizePositionBox.y = pos.y - relativeResizePositionBox.height / 2;
        }
        if (this.resizeDirections.left) {
          relativeResizePositionBox.width = oldBBox.width + oldBBox.absoluteX - pos.x;
          relativeResizePositionBox.x = pos.x + relativeResizePositionBox.width / 2;
        } else if (this.resizeDirections.right) {
          relativeResizePositionBox.width = pos.x - oldBBox.absoluteX;
          relativeResizePositionBox.x = pos.x - relativeResizePositionBox.width / 2;
        }
        shapeToResize.parentNode.setAttribute("transform", "translate(" + relativeResizePositionBox.x + "," + relativeResizePositionBox.y + ")");
        this.selectedElement.resize(relativeResizePositionBox);
      } else if (currentCommand == "connect") {
        const connectorShape = this.selectedElement.getCorropspondingShape();
        const updatePos = { x: 0, y: 0 };
        updatePos.x = pos.x - this.selectedElement.oldBBox.translateX;
        updatePos.y = pos.y - this.selectedElement.oldBBox.translateY;
        const pathdata = connectorShape.getPathData();
        if (target.classList.contains("connection-suggestion")) {
          this.connectorSnapping.snapTo = target.id;
          target.classList.add("highlight");
          const connectorPos = target.getBoundingClientRect();
          updatePos.x = connectorPos.x - this.selectedElement.oldBBox.translateX + 5;
          updatePos.y = connectorPos.y - this.selectedElement.oldBBox.translateY + 5;
        } else {
          const highlightedHandles = this.editor.svgElement.querySelectorAll(".highlight");
          for (const handle of highlightedHandles) {
            handle.classList.remove("highlight");
          }
          const previousSuggestion = this.editor.svgElement.querySelectorAll(
            ".connection-suggest:not(#" + target.id + ")"
          );
          for (const suggestion of previousSuggestion) {
            suggestion.classList.remove("connection-suggest");
          }
          if (this.elementLookup.has(target.id)) {
            this.listOfElements[this.elementLookup.get(target.id)].getCorropspondingShape().parentNode.classList.add("connection-suggest");
          }
        }
        pathdata[this.lineHandleManipulate].values = [updatePos.x, updatePos.y];
        connectorShape.setPathData(pathdata);
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
    /**
     * Relese mouse position
     */
    positionalRelease() {
      if (!this.selectedElement) {
        return;
      }
      if (this.editor.getCurrentCommand() == "connect" && this.connectorSnapping.snapTo) {
      }
      const attrs = this.getElementAttributes(this.selectedElement);
      this.undoRedo.addHistory(new ModifyCommand(
        this.selectedElement.getCorropspondingShape(),
        attrs[0],
        this.selectedElement.oldAttributes
      ));
      this.undoRedo.addHistory(new ModifyCommand(
        this.selectedElement.getCorropspondingShape().parentNode,
        attrs[1],
        this.selectedElement.oldContainerAttributes
      ));
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
      if (command.checkChange()) {
        this.history.push(command);
        this.historyIndex = this.history.length - 1;
      }
    }
    undo() {
      if (this.historyIndex >= 0) {
        this.history[this.historyIndex].undo();
        this.historyIndex--;
        if (this.historyIndex < 0) {
          this.historyIndex = 0;
        }
      }
    }
    redo() {
      if (this.historyIndex < this.history.length) {
        this.history[this.historyIndex].execute();
        this.historyIndex++;
        if (this.historyIndex >= this.history.length) {
          this.historyIndex = this.history.length - 1;
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
        } else if (ev.target.classList.contains("toolbox-button")) {
          if (ev.target.dataset.tool == "undo") {
            this.UndoRedoObj.undo();
          } else if (ev.target.dataset.tool == "redo") {
            this.UndoRedoObj.redo();
          }
        } else {
          this.elementEditorObj.positionalPress(ev, new DOMPoint(ev.clientX, ev.clientY));
        }
      } else if (ev.type == "mousemove") {
        this.elementEditorObj.positionalMove(new DOMPoint(ev.clientX, ev.clientY), ev.target);
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
/*! Bundled license information:

path-data-polyfill/path-data-polyfill.js:
  (* @license *)
*/
