class PenBrush {

    constructor() {
        this.opacity = 1;
        this.name = "PenBrush";
    }

    draw(ctx, strokeStyle, prev, curr) {
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

}

//TODO DiscBrush
class DiscBrush extends  PenBrush {
    constructor() {
        super();
        this.name = "DiscBrush";
    }

    draw(ctx, strokeStyle, prev, curr) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, 15, false, Math.PI * 2, false);
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

    draw(ctx, strokeStyle, prev, curr) {
        ctx.strokeStyle = strokeStyle;
        var length = 15;
        ctx.save();
        ctx.translate(curr.x, curr.y);
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
        ctx.restore();
    }
}

