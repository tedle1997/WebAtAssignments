class App {
    constructor({canvas, buttons, brushToolbar}) {
        this.canvas = canvas;
        this.buttons = {};
        this.buttons.clear = document.getElementById(buttons.clear);
        this.buttons.camera = document.getElementById(buttons.camera);
        this.buttons.undo = document.getElementById(buttons.undo);
        this.brushToolbar = brushToolbar;

        const context = this.canvas.getContext("2d");
        context.strokeStyle = "black";

        this.currpos = {x:0, y:0};
        this.prevpos = {x:0, y:0};
        this.mouseIsDown = false;
        this.mouseIn = false;

        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mouseenter",this.onMouseEnter);
        this.canvas.addEventListener("mouseout", this.onMouseOut);

        this.context = this.canvas.getContext("2d");
        this.buttons.camera.addEventListener("click", function () {
            const image = document.createElement("img");
            const span = document.createElement("span");
            span.setAttribute("contenteditable", "true");
            image.src = this.canvas.toDataURL();
        });



    }

    draw(){
        this.context.beginPath();
        this.context.moveTo(this.prevpos.x, this.prevpos.y);
        this.context.lineTo(this.currpos.x, this.currpos.y);
        this.context.lineWidth = 2;
        this.context.stroke();
        this.context.closePath();
    }

    onMouseMove(e){
        if(this.mouseIsDown && this.mouseIn) {
            this.updatePositions(e);
            this.draw();
        }
    }
    onMouseDown(){
        this.mouseIsDown = true;
    }
    onMouseUp(){
        this.mouseIsDown = false;
    }
    onMouseEnter(e){
        this.mouseIn = true;
        this.updatePositions(e);
    }
    onMouseOut(){
        this.mouseIn = false;
    }
    updatePositions(e){
        this.prevpos.x = this.currpos.x;
        this.prevpos.y = this.currpos.y;
        this.currpos.x = e.x;
        this.currpos.y = e.y;
    }

    get strokeStyle(){
        return this.context.strokeStyle;
    }

    set strokeStyle(style){
        if(! (typeof style === "string")) throw Error("stroke style is a string");
        this.context.strokeStyle = style;
    }

    get defaultStrokeStyle(){
        return 'black';
    }

    clear(){
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
    }

}
