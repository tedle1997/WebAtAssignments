class App {
    constructor({canvas, buttons, brushToolbar}) {
        this.canvas = document.getElementById(canvas);
        this.buttons = {};
        this.buttons.clear = document.getElementById(buttons.clear);
        this.buttons.camera = document.getElementById(buttons.camera);
        this.buttons.undo = document.getElementById(buttons.undo);
        this.brushToolbar = document.getElementById(brushToolbar);

        this.currpos = {x:0, y:0};
        this.prevpos = {x:0, y:0};
        this.mouseIsDown = false;
        this.mouseIn = false;

        this.canvas.addEventListener("mousedown",(e) => this.onMouseDown(e));
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
        this.canvas.addEventListener("mouseenter",(e) => this.onMouseEnter(e));
        this.canvas.addEventListener("mouseout", (e)=>this.onMouseOut(e));

        this.context = this.canvas.getContext("2d");
        this.buttons.camera.addEventListener("click", function () {
            const image = document.createElement("img");
            const span = document.createElement("span");
            span.setAttribute("contenteditable", "true");
            image.src = this.canvas.toDataURL();
        });



    }

    updatePositions(e){
        this.prevpos.x = this.currpos.x;
        this.prevpos.y = this.currpos.y;
        this.currpos.x = e.x - this.canvas.offsetLeft;
        this.currpos.y = e.y - this.canvas.offsetTop;
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
    onMouseDown(e){
        this.mouseIsDown = true;
    }
    onMouseUp(e){
        this.mouseIsDown = false;
    }
    onMouseEnter(e){
        this.mouseIn = true;
        this.updatePositions(e);
    }
    onMouseOut(e){
        this.mouseIn = false;
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
