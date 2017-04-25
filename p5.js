// p5js spefic

function cmap(){
    // same as 'map' except the values are constrain between min and max
    //example cmap(this.vel.mag(), 200, 100, 3, 0);
    // will always return a value between 3 - 0;

    var args = Array.from(arguments);
    var result = map.apply(null, args);
    var high = args[args.length-1];
    var low = args[args.length-2];
    if(low > high){
        var temp = low;
        low = high;
        high = temp;
    }
    return constrain(result, low, high);
}

function chance(percent){
    return random(1) < percent;
}

function chanceOr(n1, percent, other){
    if(chance(percent)) {
        return n1;
    } else {
        return other;
    }
}

function randomVector2(range){
    return createVector(random(-range, range), random(-range, range));
}

function randomVector(min, max){
    return createVector(random(min, max), random(min, max));
}

function mouseVector(){
    return createVector(mouseX, mouseY);
}


function textStackFn(startX, startY, spaceY, canDraw){
    var rowNames = [];
    return function(rowName, value){
        var index = _.indexOf(rowNames, rowName);
        if(index === -1){
            rowNames.push(rowName);
        }
        if(canDraw){
            push();
            colorMode(RGB, 255, 255, 255);
            // noStroke();

            stroke(255);
            fill(255);
            textSize(32);
            text(rowName + ": " + value, startX , startY + (spaceY * index));
            pop();
        }
    };
}

function palette(t, dc_offset, amp, freq, phase){
    // based on http://www.iquilezles.org/www/articles/palettes/palettes.htm
    // also see http://dev.thi.ng/gradients/ for more examples and to use an interactive cosine gradient generator editor
    var a = dc_offset;
    var b = amp;
    var c = freq;
    var d = phase;

    var palette = [];
    for (var i =  0; i <  c.length; i++) {
        c[i] *= t;
        c[i] += d[i];
        var r = cos(c[i] * TWO_PI);
        r *= b[i];
        r += a[i];
        palette[i] = constrain(r, 0, 1);
    }

    return color(palette[0], palette[1], palette[2]);
}

function keyDirection(){
    var dir = createVector(0, 0);
    //w
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
        dir.y = -1;
    }
    //s
    else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
        dir.y = 1;
    }
    //d
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)){
        dir.x = 1;
    }
    //a
    else if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
        dir.x -=1;
    }
    if(dir.equals(createVector())){
        return false;
    }
    return dir;
}


// function circle(pos, size){
//     ellipse(pos.x, pos.y, size, size);
// }

// function square(pos, size){
//     rect(pos.x, pos.y, size);
// }

function hueDebug(){
    push();
    colorMode(HSB, 360, 255, 255, 255);
    _.times(360 / 19, i => {
        fill(i * 20, 255, 255);
        text("hue: " + i * 20, 50, 20 + (i * 20));
        noStroke();
        rect(50, 20 + (i * 20), 20, 20);
    });
    pop();
}

function gridPositions(width, height, stepOrStepx, stepy, startX, startY){
    var stepx = stepOrStepx || 1;
    stepy = stepy || stepOrStepx;
    startX = startX || 0;
    startY = startY || 0;
    var results = [];
    for(var x = startX; x < width; x+=stepx) {
        for(var y = startY; y < height; y+=stepy) {
            results.push(createVector(x, y));
        }
    }
    return results;
}

function mapSin(value, min, max){
    return map(sin(value), -1, 1, min, max);
}

function mapPixels(graphics, fn){
    // function take the pixel at the current position
    // and the x + y position
    var results = [];
    for(var x = 0; x < graphics.width; x++) {
        for(var y = 0; y < graphics.height; y++) {
            var index = (x + y * graphics.width) * 4;
            var r = fn(index, x, y);
            if(r) results.push(r);
        }
    }
    return results;
}


function paletteRaw(t, dc_offset, amp, freq, phase){
    // return raw color values not a p5js color
    var a = dc_offset;
    var b = amp;
    var c = freq;
    var d = phase;

    var palette = [];
    for (var i =  0; i <  c.length; i++) {
        c[i] *= t;
        c[i] += d[i];
        var r = cos(c[i] * TWO_PI);
        r *= b[i];
        r += a[i];
        palette[i] = constrain(r, 0, 1);
    }

    return palette;
}

function palette(t, dc_offset, amp, freq, phase){
    return apply(color, paletteRaw(t, dc_offset, amp, freq, phase));
}
