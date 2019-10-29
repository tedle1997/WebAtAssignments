class PenBrush {

    constructor() {
        this.opacity = 1;
        this.name = "PenBrush";
    }

    draw(ctx, strokeStyle, x, y) {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.strokeStyle = strokeStyle;
        ctx.lineTo(x, y);
        ctx.stroke();
    }

}

//TODO DiscBrush
class DiscBrush{
    constructor() {
        this.opacity = 1;
        this.name = "DiscBrush";
    }

    draw(ctx, strokeStyle, x, y) {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.strokeStyle = strokeStyle;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}
//TODO StarBrush
class StarBrush{
    constructor() {
        this.opacity = 1;
        this.name = "PenBrush";
    }

    draw(ctx, strokeStyle, x, y) {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.strokeStyle = strokeStyle;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}
