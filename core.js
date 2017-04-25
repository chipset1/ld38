// general javascript util

function returnRandom(array){
    // return a random element from an array
    return array[int(random(array.length))];
}

function inbetween(number, min, max){
    return (number > min && number < max);
}

function arrayRemove (array, from) {
    return array.splice(from, 1);
}

function clog(){
    console.log.apply(null, Array.from(arguments));
}

// rest
function autoDat(obj){
    // only numbers
    // min and max 0 100 default
    // {param: {min: 0 max: 20}}
    var gui = new dat.GUI();
    var keys = Object.keys(obj); // use Object.entries
    keys.forEach(function(k){
        if(typeof(obj[k]) === "object"){
            var args = obj[k];
            args.min = args.min || 0;
            args.max = args.max || 100;
            obj[k] = args.min;
            gui.add(obj, k).min(args.min).max(args.max);
        }else{
            gui.add(obj, k).min(0).max(100);
        }
    });
}

function apply(fn, args){
    return fn.apply(null, args);
}

function multiple(n1, ...args){
    // return n1 % ===
    return _.some(args, function(n2){return n1 % n2 === 0;});
}


function Timer(interval) {
    var self = this;
    var lastInterval = -1;
    var cycleCounter;

    self.canRun = function(wait) {
        // wait toggle whether the timer should run and return turn
        // immediately or if it should wait 1 cycle before returning turn
        wait = wait || false;
        var curr = millis();
        if(lastInterval < 0 && wait) lastInterval = curr;
        if(curr-lastInterval >= interval || (lastInterval < 0 && !wait)) {
            lastInterval = curr;
            return true;
        }
        return false;
    };

}
