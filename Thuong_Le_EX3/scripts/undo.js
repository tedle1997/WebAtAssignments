let history = {
    paths: [],

    pop: function () {
        return this.paths.pop();
    },
    
    initializeNewPath: function () {

    },

    push: function(stroke){
        if(!(stroke instanceof Stroke)) return Error("Wrong type, object must be Stroke");
        this.paths.push(stroke);
    },

    clear: function(){
        this.paths = [];
    },

    
};

class Stroke{
    constructor(brushName){
        this.brushName = document.getElementById(brushName);
    }
    
}
