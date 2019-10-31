class App {
    constructor({canvas, buttons, brushToolbar}) {
        this.canvas = document.getElementById(canvas);
        this.buttons = {};
        this.buttons.clear = document.getElementById(buttons.clear);
        this.buttons.camera = document.getElementById(buttons.camera);
        this.buttons.undo = document.getElementById(buttons.undo);
        this.brushToolbar = document.getElementById(brushToolbar);
        this.context = this.canvas.getContext("2d");

        this.pen = document.createElement("button", {id : "pen"});
        this.pen.innerHTML = "pen";
        this.brushToolbar.appendChild(this.pen);
        this.pen.addEventListener("click", (e) => function (e) {
            var penBrush = new penBrush();
            penBrush.draw(this.context, App.defaultStrokeStyle, e.x,e.y,);
        });

        this.disc = document.createElement("button", {id : "disc"});
        this.disc.innerHTML = "disc";
        this.brushToolbar.appendChild(this.disc);

        this.star = document.createElement("button", {id : "star"});
        this.star.innerHTML = "star";
        this.brushToolbar.appendChild(this.star);

        this.currpos = {x:0, y:0};
        this.prevpos = {x:0, y:0};
        this.mouseIsDown = false;
        this.mouseIn = false;
        this.currStroke = new Stroke();

        this.canvas.addEventListener("mousedown",(e) => this.onMouseDown(e));
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
        this.canvas.addEventListener("mouseenter",(e) => this.onMouseEnter(e));
        this.canvas.addEventListener("mouseout", (e)=>this.onMouseOut(e));



        this.buttons.camera.addEventListener("click", function () {
            var image = document.createElement("img");
            var span = document.createElement("span");
            span.setAttribute("contenteditable", "true");
            span.appendChild(image);
            var c = document.getElementById("canvas");
            image.src = c.toDataURL("image/png");
            var fav_container = document.getElementById("favourites");
            fav_container.appendChild(span);
        });

        this.buttons.clear.addEventListener("click", function () {
            var c = document.getElementById("canvas");
            var ctx = c.getContext("2d");
            ctx.clearRect(0,0, c.width, c.height);
            history.clear();
        });

        this.buttons.undo.addEventListener("click", function () {

            let c = document.getElementById("canvas");
            let ctx = c.getContext("2d");
            ctx.clearRect(0,0, c.width, c.height);

            history.pop();
            for (let i = 0; i < history.paths.length; i++){
                let sq = history.paths[i].stroke_sequence;
                for(let j = 0; j < sq.length; j++){
                    // console.log(sq[j].prev.x, "  ", sq[j].prev.y);
                    // console.log(sq[j].curr.x, "  ", sq[j].curr.y);
                    ctx.beginPath();
                    ctx.moveTo(sq[j].prev.x, sq[j].prev.y);
                    ctx.lineTo(sq[j].curr.x, sq[j].curr.y);
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        })
        
        this.brushToolbar.addEventListener("click", function () {

        })
    }
    //doing
    updatePositions(e){
        this.prevpos.x = this.currpos.x;
        this.prevpos.y = this.currpos.y;
        this.currpos.x = e.x - this.canvas.offsetLeft;
        this.currpos.y = e.y - this.canvas.offsetTop;

        console.log(this.currStroke);
    }


    draw(){
        this.context.beginPath();
        this.context.moveTo(this.prevpos.x, this.prevpos.y);
        this.context.lineTo(this.currpos.x, this.currpos.y);
        this.currStroke.add_loc(this.prevpos.x, this.prevpos.y, this.currpos.x , this.currpos.y);
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
        this.updatePositions(e);
    }
    onMouseUp(e){
        this.mouseIsDown = false;
        history.push(this.currStroke);
        this.currStroke = new Stroke();
    }
    onMouseEnter(e){
        this.mouseIn = true;
    }
    onMouseOut(e){
        this.mouseIn = false;
    }



    get strokeStyle(){
        return this.canvas.strokeStyle;
    }

    set strokeStyle(style){
        if(! (typeof style === "string")) throw Error("stroke style is a string");
        this.canvas.strokeStyle = style;
    }

    static defaultStrokeStyle = "black";


}
