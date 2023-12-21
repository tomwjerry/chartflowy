'use strict';

class RenderStack {
    shapeStack;
    guiStack;

    constructor() {
        this.shapeStack = [];
        this.guiStack = [];
    }

    render(context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        for (let shape of this.shapeStack) {
            if (shape.drawAttributes.strokeColor) {
                ctx.beginPath();
                if (shape.drawAttributes.lineDash) {
                    ctx.setLineDash(shape.drawAttributes.lineDash);
                }
            }

            if (shape.drawAttributes.fillColor) {
                ctx.fillStyle = shape.drawAttributes.fillColor;
            }

            switch (shape.shapeKey) {
                case 'rectangle':
                    context.rect(shape.boundingBox.x,
                        shape.boundingBox.y,
                        shape.boundingBox.width,
                        shape.boundingBox.height);
                    break;
                case 'ellipse':
                    ctx.ellipse(shape.boundingBox.x,
                        shape.boundingBox.y,
                        shape.drawAttributes.radiusX,
                        shape.drawAttributes.radiusY,
                        0,
                        0,
                        Math.PI * 2);
                    break;
                default:
                    break;
            }

            if (shape.drawAttributes.strokeColor) {
                ctx.lineWidth = shape.drawAttributes.lineWidth ?? 1;
                ctx.strokeStyle = shape.drawAttributes.strokeColor;
                ctx.stroke();
            }
            if (shape.drawAttributes.fillColor) {
                ctx.fill();
            }

            ctx.lineWidth = 1;
            ctx.strokeStyle = '#000000';
            ctx.setLineDash([]);
            ctx.fillStyle = '#ffffff';
        }
    }

    // Normally, we do not need to activly update rendinging, so this function put it to rest
    rest() {

    }

    // Activate live update, run this when the user interacts with the application
    activeUpdate() {
    }
}
