class App {
    constructor({canvas, buttons, brushToolbar}) {
        this.canvas = canvas;
        this.buttons = {};
        this.buttons.clear = document.getElementById(buttons.clear);
        this.buttons.camera = document.getElementById(buttons.camera);
        this.buttons.undo = document.getElementById(buttons.undo);
        this.brushToolbar = brushToolbar;
    }

    draw(){
        let context = this.canvas.getContext();
        context.onmousedown = function (e) {

        };
        context.onmousemove = function (e) {

        };
        context.onmouseup = function (e) {

        };
    }

    get strokeStyle(){
        return this.canvas.getContext().strokeStyle;
    }

    set strokeStyle(style){
        if(! (typeof style === "string")) throw Error("stroke style is a string");
        this.canvas.strokeStyle = style;
    }

    clear(){
        this.canvas.getContext().restore();
    }
}

