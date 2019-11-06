let history = {
    paths: [],

    pop: function () {
        return history.paths.pop();
    },
    
    initializeNewPath: function () {
        history.paths = [];
    },

    push: function(stroke){
        if(stroke instanceof Stroke) {
            history.paths.push(stroke);
        } else throw(Error);
    },

    clear: function() {
        history.paths = [];
    }
};

class Stroke {
    stroke_sequence = [];
    color_sequence = [];
    constructor(brushName) {
        this.brushName = brushName;

    }

    add_loc(prev_x, prev_y, curr_x, curr_y, color) {
        let location = {
            prev:{x:prev_x, y:prev_y},
            curr:{x:curr_x, y:curr_y}
        };
        this.stroke_sequence.push(location);
        this.color_sequence.push(color);
    }
}

