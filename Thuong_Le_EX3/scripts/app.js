class App {
    constructor({canvas, buttons, brushToolbar}) {
        this.canvas = document.getElementById(canvas);
        this.buttons = {};
        if (buttons) {
            this.buttons.clear = document.getElementById(buttons.clear);
            this.buttons.camera = document.getElementById(buttons.camera);
            this.buttons.undo = document.getElementById(buttons.undo);
        }
        this.brushToolbar = document.getElementById(brushToolbar);
        this.context = this.canvas.getContext("2d");
        this.currpos = {x:0, y:0};
        this.prevpos = {x:0, y:0};
        this.mouseIsDown = false;
        this.mouseIn = false;
        this.currStroke = new Stroke();
        this.penStyle = "";
        this.strokeStyle = "black";

        if(this.brushToolbar){
            this.pen = document.createElement("button", {id : "pen"});
            this.pen.innerHTML = "pen";
            this.brushToolbar.appendChild(this.pen);
            this.pen.addEventListener("click", (e) => this.setBrush(e, "PenBrush"));

            this.disc = document.createElement("button", {id : "disc"});
            this.disc.innerHTML = "disc";
            this.brushToolbar.appendChild(this.disc);
            this.disc.addEventListener("click", (e) => this.setBrush(e,"DiscBrush"));

            this.star = document.createElement("button", {id : "star"});
            this.star.innerHTML = "star";
            this.brushToolbar.appendChild(this.star);
            this.star.addEventListener("click", (e) => this.setBrush(e,"StarBrush"));
        }

        this.canvas.addEventListener("mousedown",(e) => this.onMouseDown(e));
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
        this.canvas.addEventListener("mouseenter",(e) => this.onMouseEnter(e));
        this.canvas.addEventListener("mouseout", (e)=>this.onMouseOut(e));



        if (this.buttons.camera) {
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
        }

        if (this.buttons.clear) {
            this.buttons.clear.addEventListener("click", function () {
                var c = document.getElementById("canvas");
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, c.width, c.height);
                history.clear();
            });
        }

        if (this.buttons.undo){
            this.buttons.undo.addEventListener("click", (e) => {
                let c = document.getElementById("canvas");
                let ctx = c.getContext("2d");
                ctx.clearRect(0,0, c.width, c.height);

                history.pop();
                for (let i = 0; i < history.paths.length; i++){
                    let sq = history.paths[i].stroke_sequence;
                    let sc = history.paths[i].color_sequence;
                    let bn = history.paths[i].brushName;
                    for(let j = 0; j < sq.length; j++){
                        if(bn === "PenBrush"){
                            console.log("reach draw() Pen");
                            let brush = new PenBrush();
                            brush.draw(ctx, sc[j], sq[j].prev, sq[j].curr);
                        } else if (bn === "DiscBrush"){
                            let brush = new DiscBrush();
                            brush.draw(ctx, sc[j], sq[j].prev, sq[j].curr);
                        } else if (bn === "StarBrush"){
                            let brush = new StarBrush();
                            brush.draw(ctx, "green", sq[j].prev, sq[j].curr);
                        }
                    }
                }
            })
        }

    }

    setBrush(e, brush){
        console.log("reach brush selection");
        this.penStyle = brush;
        this.currStroke = new Stroke(brush);
    }

    //doing
    updatePositions(e){
        this.prevpos.x = this.currpos.x;
        this.prevpos.y = this.currpos.y;
        this.currpos.x = e.x - this.canvas.offsetLeft;
        this.currpos.y = e.y - this.canvas.offsetTop;

    }


    draw(){
        let color = this.randomColor();
        this.currStroke.add_loc(this.prevpos.x, this.prevpos.y, this.currpos.x , this.currpos.y,color);
        if(this.penStyle === "PenBrush"){
            let brush = new PenBrush();
            brush.draw(this.context, color, this.prevpos, this.currpos);
        } else if (this.penStyle === "DiscBrush"){
            let brush = new DiscBrush();
            brush.draw(this.context, color, this.prevpos, this.currpos);
        } else if (this.penStyle === "StarBrush"){
            let brush = new StarBrush();
            brush.draw(this.context, "green", this.prevpos, this.currpos);
        }

    }

    onMouseMove(e){
        if(this.mouseIsDown && this.mouseIn) {
            this.updatePositions(e);
            this.draw();
        }
    }
    onMouseDown(e){
        console.log(this.penStyle);
        this.mouseIsDown = true;
        this.updatePositions(e);
    }
    onMouseUp(e){
        this.mouseIsDown = false;
        history.push(this.currStroke);
        this.currStroke = new Stroke(this.penStyle);
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

    randomColor(){
        return "RGB(" + Math.round(Math.random()*255) + ","  + Math.round(Math.random()*255) + ", " + Math.round(Math.random()*255) + ")";
    }

    static defaultStrokeStyle = "black";


}
