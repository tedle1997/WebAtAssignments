let history = {
    paths: [],

    pop: function () {
        this.paths.pop();
    },
    
    initializeNewPath: function () {

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
    constructor(brushName, prevpos, currpos){
        this.brushName = document.getElementById(brushName);
        this.currpos = currpos;
        this.prevpos = prevpos;
    }
    
}
