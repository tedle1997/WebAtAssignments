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
class DiscBrush extends  PenBrush {
    constructor() {
        super();
        this.name = "DiscBrush"
    }

    draw(ctx, strokeStyle, x, y) {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.fillStyle = strokeStyle;
        ctx.beginPath();
        ctx.arc(x, y, 15, false, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
    }
}
//TODO StarBrush
class StarBrush extends PenBrush {
    constructor(){
        super();
        this.name = "StarBrush"
    }

    draw(ctx, strokeStyle, x, y) {
        var length = 15;

        ctx.translate(x, y);
        ctx.beginPath();
        ctx.rotate((Math.PI * 1 / 10));
        for (var i = 5; i--;) {
            ctx.lineTo(0, length);
            ctx.translate(0, length);
            ctx.rotate((Math.PI * 2 / 10));
            ctx.lineTo(0, -length);
            ctx.translate(0, -length);
            ctx.rotate(-(Math.PI * 6 / 10));
        }
        ctx.lineTo(0, length);
        ctx.closePath();
        ctx.stroke();
    }
}
