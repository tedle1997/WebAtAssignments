let history = {
    paths:[],

    pop: function () {
        return this.paths.pop();
    },
    
    initializeNewPath: function () {
        this.paths = [];
    },

    push: function(stroke){
        if(stroke instanceof Stroke) {
            this.paths.push(stroke);
        } else throw(Error);
    },

    clear: function(){
        this.paths = [];
    },

    
};

class Stroke{
    stroke_sequence = [];
    constructor(brushName){
        this.brushName = document.getElementById(brushName);
    }

    add_loc(prev_x, prev_y, curr_x, curr_y){
        let location = {
            prev:{x:prev_x, y:prev_y},
            curr:{x:curr_x, y:curr_y}
        };
        this.stroke_sequence.push(location);
    }
    get stroke_sequence(){
        return this.stroke_sequence;
    }
    
}

