"use strict";
var debugText = textStackFn(20, 40, 20, false);
var toggleParticleClickTrails = false;


var trailsCanvas1;
var trailsCanvas2;
var entityContainer = new EntityContainer();
var moonImage;
var gameNotStarted=true;

var dt = 1/60.0;
var currentTime = 0;
var font;
var music;
var score = 0;
var musicAmplitude;
var enemyTimer;
var steerTimer;

var steerSizeParam = {min: 10, max: 30};
var enemyHue = {min: 240, max: 300};
var bigPlanetSize = {min: 300, max: 800};
var imagePosition;

function preload(){
    font = loadFont('RubikMonoOne-Regular.ttf');
    music = loadSound("music.wav");

}

function setup(){
    var canvas = createCanvas(1700, 800);
    trailsCanvas1 = createGraphics(width, height);
    trailsCanvas2 = createGraphics(width, height);
    canvas.parent('container');
    textFont(font);
    enemyTimer = new Timer(500);
    imagePosition = createVector((width/2) -300, 20);

    moonImage = loadImage("moon-26619_960_720.png");
    musicAmplitude = new p5.Amplitude();
    // moonImage = loadImage("cat1.png");
    // moonImage = loadImage("blazing-2024290_960_720.png");

    // moonImage = loadImage("moon1.png");
    colorMode(HSB, 360, 100, 100, 1.0);
    trailsCanvas1.colorMode(HSB, 360, 100, 100, 1.0);
    trailsCanvas2.colorMode(HSB, 360, 100, 100, 1.0);

    addPlanet(10);
    init();
    music.loop();
}

function createSteerer(x, y, notPickedUp){
    // 13, 16, f 0.4, 0.75
    // scale up speed/force to be per second speed (to work with delta time)
    // vs per frame speed/force
    var dtMult = 60;
    const lowSpeed = 5 * dtMult;
    const highSpeed = 10 * dtMult;
    let maxSpeed = random(lowSpeed, highSpeed);
    let maxForce = random(0.4, 0.75) * dtMult;
    let mapSpeed = (min, max) => {
        return map(maxSpeed, lowSpeed, highSpeed, min, max);
    };
    let scrollVelX = mapSpeed(-190, -140);
    if(notPickedUp === undefined) notPickedUp = true;
    var fillColor = color(random(160, 200), 100, 100, mapSpeed(0.9, 0.2));
    return {pos: createVector(x, y),
            maxSpeed: maxSpeed,
            maxForce: maxForce,
            shootTimer: new Timer(mapSpeed(800, 2000)/10), // 800, 2000
            bulletSpeed: -mapSpeed(500, 780),
            type: "steer",
            notPickedUp: notPickedUp,
            size: mapSpeed(steerSizeParam.min, steerSizeParam.max),
            display: {shape: "ellipse",
                      imageLookUp: true,
                      drawTrails1: true,
                      fillColor: fillColor,
                      originalFillColor: fillColor},
            vel: createVector(scrollVelX, 0),
            acc: createVector(0, 0)};
}

function init(){
    let amount = 10;
    score = 0;

    steerTimer = new Timer(2000);
    entityContainer.clear();
    _.times(amount, (i)=>{
        entityContainer.add (createSteerer(0, height/2, false));
    });
    addPlanet(10);
}

function collides(entity1, entity2){
    var AABBvsAABB = function(e1, e2){
        // edges for A
        var a_left= e1.pos.x;
        var a_right = e1.pos.x + e1.size;
        var a_top = e1.pos.y;
        var a_bottom = e1.pos.y + e1.size;
        // edges for B
        var b_left= e2.pos.x;
        var b_right = e2.pos.x + e2.size;
        var b_top = e2.pos.y;
        var b_bottom = e2.pos.y + e2.size;

        return a_right >= b_left && a_left <= b_right && a_bottom >= b_top && a_top <= b_bottom;
    };

    if(entity2.display.shape === "rect") {
        return AABBvsAABB(entity1, entity2);
    } else {
        return (entity1.pos.dist(entity2.pos) > 0) && (entity1.pos.dist(entity2.pos) < entity1.size + entity2.size);
    }
}

function addSteerer(amount){
    amount = amount || 10;
    _.times(amount, ()=>{
        entityContainer.add(createSteerer((width)+600, random(100, height-100)));
    });
}

function addPlanet(){
    let prevX = width;
    const amount = 30;
    _.times(amount, (i)=>{
        var size = random(bigPlanetSize.min, bigPlanetSize.max);
        // var velX = map(size, 100, 400, -50, -1);
        var velX = size < 500 ? map(size, 300, 800, -5, -1) : map(size, 300, 800, -30, -1);
        let offsetX = -map(amount, 1, 20, 500, 1000);
        var x = random(-size, width+size)
        var hue =random(185, 230);
        var sat = random(30, 60);
        // var x = multiple(i, 5) ? prevX : prevX + size;
        // prevX = x;
        entityContainer.add ({pos: createVector(x, random(0, height)),
                              originalX: width + size/2,
                              type: "bigPlanet",
                              size: size,
                              originalSize: size,
                              display: {shape: "ellipse",
                                        hue: hue,
                                        saturation: sat,
                                        fillColor: color(hue, sat, 100, 0.1)},
                              vel: createVector(velX, 0),
                              acc: createVector(0, 0)});
    });
}

function updateEntity(deltaTime, e){
    e.vel.add(e.acc);
    if(e.velScale) e.vel.mult(e.velScale);
    e.pos.add(e.vel.copy().mult(deltaTime));
    e.acc.mult(0);
}

function imageGet(x, y){
    let pixelX = x + (width/2 - 300),
        pixelY = y + 50;
    return moonImage.get(x, y);
}

function displayEntity(entity){
    var fillColor = entityFillColor(entity);
    let display = entity.display;
    var drawOnCanvas = (canvas) => {
        if(display.strokeColor){
            canvas.stroke(entityStrokeColor(entity));
            if(display.strokeWeight) canvas.strokeWeight(display.strokeWeight);
        } else{
            canvas.noStroke();
        }
        if(display.imageLookUp && mouseIsPressed){
            if(entity.pos.x > imagePosition.x && entity.pos.x < imagePosition.x + moonImage.width){
                let imageColor = moonImage.get(entity.pos.x - (width/2 - 300), entity.pos.y - imagePosition.y);
                if(hue(imageColor) > 0){
                    let eHue = hue(entityFillColor(entity)),
                        newColor = color(hue(imageColor), 50, 100, 0.25);
                    display.fillColor = newColor;
                } else {
                    display.fillColor = display.originalFillColor;
                }
            } else {
                display.fillColor = display.originalFillColor;
            }
        }

        if(fillColor) {
            canvas.fill(fillColor);
        } else {
            canvas.noFill();
        }
        if(display.shape === "rect"){
            canvas.rect(entity.pos.x, entity.pos.y, entity.size, entity.size);
        } else {
            canvas.ellipse(entity.pos.x, entity.pos.y, entity.size, entity.size);
        }
    };

    colorMode(HSB, 360, 100, 100, 1.0);
    if(display.drawTrails1){
        drawOnCanvas(trailsCanvas1);
    } else if(display.drawTrails2){
        drawOnCanvas(trailsCanvas2);
    } else {
        if(display.strokeColor){
            stroke(entityStrokeColor(entity));
            if(display.strokeWeight) strokeWeight(display.strokeWeight);
        } else{
            noStroke();
        }
        if(fillColor) {
            fill(fillColor);
        } else {
            noFill();
        }
        if(display.shape === "rect"){
            rect(entity.pos.x, entity.pos.y, entity.size, entity.size);
        } else {
            ellipse(entity.pos.x, entity.pos.y, entity.size, entity.size);
        }
    }
}

function addEnemy(){
    let size = random(20, 50);
    let velX = map(size, 20, 50, -200, -500);
    let health = 20;
    let hue = random(enemyHue.min, enemyHue.max);
    let y = random(size, height-size);
    let deadHue = map(hue, enemyHue.min, enemyHue.max, enemyHue.min - 100, enemyHue.max - 100);
    if(chance(0.320)){
        size = random(150, 350);
        velX = map(size, 150, 350, -50, -100);
        health = 200;
        y = random(-size/2, width);

    }
    entityContainer.add({pos: createVector(width+100+size, y),
                         type: "enemy",
                         acc: createVector(),
                         size: size,
                         display: {fillColor: color(hue, 50, 100, 0.9),
                                   deadHue: deadHue,
                                   originalHue: hue,
                                   drawTrails1: true,
                                   shape: "rect"},
                         health: health,
                         originalHealth: health,
                         isDead: (entity)=>{
                             return entity.pos.x < 0 - entity.size || entity.health === 0;
                         },
                         vel: createVector(velX, 0)});
}

function onEnemyDeath(enemy){
    var size = random(30, 50);
    if(enemy.size>100){
        addParticle(enemy, 15, {size: {min: 150, max: 300, percent: 0.9}}, null, "rect");
    }

    // {display: {fillColor: color(hue(entityFillColor(entity)), random(30, 100), 100, 0.8),
    //            drawTrails1: true,
    //            shape: "ellipse"}},
    addParticle(enemy, 15, {size: {min: 80, max: 100, percent: 0.3}});
    enemy.isDead =  ()=>{return true;};
}

function onClickDrawTrail(entity){
    if(mouseIsPressed){
        entity.display.drawTrails1 = false;
        entity.display.drawTrails2 = true;
    } else {
        entity.display.drawTrails1 = true;
        entity.display.drawTrails2 = false;
    }
}

function update(deltaTime){
    if(enemyTimer.canRun()) addEnemy();
    entityContainer.get("steer").map((entity, i)=>{
        onClickDrawTrail(entity);
        if(entity.notPickedUp) return;
        let forceOffset = 0;
        let speedOffset = 0;
        let distance = mouseVector().copy().sub(entity.pos).mag();
        if(mouseIsPressed) {
            let scaleForce = cmap(distance, 0, 400, 0.0, 0.02);
            let scaleSpeed = cmap(distance, 0, 400, 0.0, 0.02);
            forceOffset = entity.maxForce * scaleForce;
            speedOffset = entity.maxSpeed * scaleSpeed;
        }
        let steer = new SteerBehavior(entity.maxSpeed + speedOffset, entity.maxForce + forceOffset);
        var angle = entity.pos.copy().sub(mouseVector()).heading();
        steer.arrive(entity, mouseVector(), 200);
        if(!mouseIsPressed){
            let desiredSeparation = cmap(distance, 0, 400, 0, 30);
            steer.separate(entity, entityContainer.get("steer"), desiredSeparation);
        }
    });

    var notPickedUp = _.filter(entityContainer.get("steer", "notPickedUp"));
    entityContainer.get("steer").map((steer1)=>{
        if(!steer1.notPickedUp){
            notPickedUp.forEach((steer2)=>{
                if(collides(steer1, steer2)){
                    steer2.notPickedUp = false;
                }
            });
        }
        if(!steer1.notPickedUp){
            entityContainer.get("enemy").forEach((enemy)=>{
                if(collides(steer1, enemy)){
                    onEnemyDeath(enemy);
                    addParticle(steer1, 55);
                    steer1.isDead = ()=>{return true;};
                }
            });
        }
    });
    entityContainer.get("bullet").map((bullet)=>{
        entityContainer.get("enemy").forEach((enemy)=>{
            if(collides(bullet, enemy)){

                enemy.health--;
                if(enemy.health <= 0) {
                    score +=100;
                    if(enemy.size > 100) score +=100;
                    onEnemyDeath(enemy);
                }
                bullet.isDead = ()=>{ return true;};

                addParticle(bullet, 3);
                var vel = createVector(1, random(-1, 1));
                vel.mult(160);
                addParticle(enemy, 1,
                            {stroke: {color: color(hue(enemy.display.fillColor), random(0, 40), 100, 0.8),
                                      percent: 0.5}},
                            {size: enemy.size,
                             vel: vel,
                             display: {strokeColor: enemy.display.fillColor,
                                       fillColor: null,
                                       drawTrails1: true,
                                       shape: "rect"}})
            }
        });
    });
    entityContainer.get("bigPlanet").forEach((bigPlanet, i)=>{
        if(bigPlanet.pos.x < (0 - bigPlanet.size/2)){
            bigPlanet.pos = createVector(bigPlanet.originalX + 100, random(100, height - 100));
        }
    });
    if(toggleParticleClickTrails) entityContainer.get("particle").map(onClickDrawTrail);

    removeIfdead(entityContainer.get("bullet"));
    removeIfdead(entityContainer.get("steer"));
    removeIfdead(entityContainer.get("enemy"));
    removeIfdead(entityContainer.get("particle"));
    entityContainer.get("enemy").forEach((enemy)=>{
        // 3 the the alpha
        var fillColor = enemy.display.fillColor;
        var alpha = map(enemy.health, enemy.originalHealth, 0, 0.9, 0.0);
        // enemy.display.fillColor._array[3] = map(enemy.health, enemy.originalHealth, 0, 0.9, 0.3);
        var hue = map(enemy.health, enemy.originalHealth, 0, enemy.display.originalHue, enemy.display.deadHue);
        enemy.display.fillColor = color(hue, saturation(fillColor), brightness(fillColor), alpha);
    });

    entityContainer.getAll().map(_.partial(updateEntity, deltaTime));
}

function gameIsOver(){
    return _.filter(entityContainer.get("steer"), (s)=>{
        return !s.notPickedUp;
    }).length === 0;
}

function draw(){
    background(255);

    trailsCanvas1.background(0, 0.05);
    trailsCanvas2.background(0, 0.001);

    image(trailsCanvas1, 0, 0);
    image(trailsCanvas2, 0, 0);

    // var level = musicAmplitude.getLevel();
    // var s = map(level, 0, 0.4, 0, 1500);
    // rect(0, height/2, s, 40);
    entityContainer.get("bigPlanet").forEach((bigPlanet, i)=>{
        var level = musicAmplitude.getLevel();
        alpha=min(alpha, 0.2);
        var sat = map(level, 0, 0.4, bigPlanet.display.saturation, bigPlanet.display.saturation * 1.4);
        var maxScale = 1.02;
        var scaleAmount = map(bigPlanet.size, bigPlanetSize.min, bigPlanetSize.max, maxScale, 1.005);
        scaleAmount = min(scaleAmount, maxScale);
        bigPlanet.size = map(level, 0, 0.4, bigPlanet.originalSize, bigPlanet.originalSize * scaleAmount);
        // var size = map(leve)
        if(i === 0) debugText("amp", level);
        bigPlanet.display.fillColor = color(bigPlanet.display.hue, sat, 100, 0.1);
    });
    // image(moonImage, 0, 0);

    // fill(moonImageGet(mouseVector().x, mouseVector().y));
    // rect(mouseVector().x, mouseVector().y, 20, 20);
    // debugText("fill", moonImageGet(mouseVector().x, mouseVector().y));
    // debugText("fill2", hue(moonImageGet (mouseVector().x, mouseVector().y)));
    // debugText("mouse", mouseVector());


    if(steerTimer.canRun()) addSteerer(1);

    debugText("FR", int(frameRate()));
    debugText("particle", entityContainer.get("particle").length);
    debugText("all", entityContainer.getAll().length);

    stroke(255, 100);
    noFill();
    rect(0, 0, width-1, height-1);

    if(gameNotStarted){
        if(keyDown(" ")){
            currentTime = millis();
            gameNotStarted = false;
        }

        fill(255,0.7);
        textSize(52);
        noStroke();
        text("-LD38-", (width/2) - 100, height/2);
        text("Planet Pickup", (width/2) - 240, (height/2) + 40);
        text("press space to start", (width/2) - 400, (height/2)+100);
        return;
    }

    var newTime = millis();
    var frameTime = (newTime - currentTime) / 1000;
    currentTime = newTime;
    var deltaTime = min(frameTime, dt);
    while ( frameTime > 0.0 ){
        update(deltaTime);
        frameTime -= deltaTime;
    }
    if(keyIsDown(32)) addBullets();
    entityContainer.getAll().map(displayEntity);

    if(gameIsOver()) {
        textSize(60);
        fill(255);
        text("GAME OVER", (width/2)-300, height/2);
        text("SPACE TO RESTART", (width/2)-420, (height/2) + 50);
    }
    textSize(90);
    fill(255, 0.2);
    text("score:" + score, (width/2) - 300, 100);
}

function addParticle(entity, amount, params, overrideData, type){

    let alpha = 0.8;
    amount = amount || 1;
    _.times(amount , () => {
        var size = random(10, 30);
        if(params && params.hasOwnProperty("size")){
            size = chanceOr(random(params.size.min, params.size.max), params.size.percent, size);
        }
        if(params && params.hasOwnProperty("stroke")){
            var strokeColor = overrideData.display.strokeColor;
            overrideData.display.strokeColor = chanceOr(params.stroke.color, params.stroke.percent, strokeColor);
        }
        var vel = randomVector(-360, 360);
        type = type || "ellipse";
        entityContainer.add(_.merge({pos: entity.pos.copy(),
                                     type: "particle",
                                     acc: createVector(),
                                     size: size,
                                     velScale: 1.02,
                                     // particle: {transition: new Transition(300).start()},
                                     display: {fillColor: color(hue(entityFillColor(entity)), random(30, 100), 100, alpha),
                                               drawTrails1: true,
                                               shape: type},
                                     isDead: isOffScreen,
                                     vel: vel},
                                    overrideData));
    });
}

function addBullets(){
    entityContainer.get("steer").map((entity)=>{
        if(!entity.notPickedUp && entity.shootTimer.canRun()) {
            // let vel = mouseVector().sub(entity.pos);
            let vel = createVector(-1, 0);
            vel.normalize();
            if(mouseIsPressed) {
                vel.mult(entity.bulletSpeed);
            } else {
                vel.mult(entity.bulletSpeed*0.2);
            }
            var rcolor = ()=> {
                var h = mouseIsPressed ? random(280, 330) : random(200, 260);
                return color(h, 80, 100, 0.3);
            };
            var size = entity.size;
            var display = {fillColor: rcolor,
                           originalFillColor: rcolor,
                           strokeColor: color(random(180, 230), 30, 100, 0.4),
                           strokeWeight: 2,
                           // color(random(200, 260), 80, 100, 0.2),
                           imageLookUp: true,
                           drawTrails1: true,
                           shape: "rect"};
            if(mouseIsPressed){
                display.drawTrails1 = false;
                display.drawTrails2 = true;
                display.strokeColor = false;
                size = random(size/2, entity.size);
                // display.strokeWeight = false;
            }
            var velScale = map(entity.size, steerSizeParam.min, steerSizeParam.max, 1.039, 1.03);
            entityContainer.add({pos: entity.pos.copy().add(randomVector2(20)),
                                 type: "bullet",
                                 acc: createVector(),
                                 size: size,
                                 velScale: velScale,
                                 display: display,
                                 isDead: isOffScreen,
                                 vel: vel});
        }
    });
}

function keyPressed(){
    if(keyDown("t")) init();
    if(!gameNotStarted && keyDown(" ")) {
        clog("yo");
    }
    if(gameIsOver() && keyDown(" ")) init();
    // if(keyDown("s")) trailsCanvas2.background(255, 0.2);

}

function keyDown(pressedKey){
    return key.toLowerCase() === pressedKey;
}

function EntityContainer(){
    var self = this;
    var entitiesByType = {};
    var id = 0;

    function addByType(entity){
        //constructor name will return a string
        var type = entity.type || entity.constructor.name;
        var array = entitiesByType[type];
        if(type === "") {
            clog("constructor name not found");
            return;
        }
        if(array){
           array.push(entity);
        } else {
            entitiesByType[type] = [entity];
        }
    }

    self.add = function(entity){
        addByType(entity);
    };

    self.getAll = function(){
        return _.flatten(Object.values(entitiesByType));
    };

    self.get = function(type){
        // type is string eg Bullet Enemy
        return entitiesByType[type] || [];
    };
    self.clear = function(){
        entitiesByType = {};
    };
}

function mapPixels(graphics, fn){
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

function Transition(length){
    var self = this;
    var startTime = 0;

    self.start = function(){
        startTime = millis();
        return self;
    };

    self.map = function(min, max){
        return map(millis(), startTime, startTime + length, min, max);
    };

    self.isRunning = function(){
        // come up with a better function name
        return (millis() > startTime + length);
    };
}

function entityStrokeColor(entity){
    var display = entity.display;
    if(typeof display.strokeColor === "function"){
        return display.strokeColor(entity);
    } else {
        return display.strokeColor;
    }
}

function entityFillColor(entity){
    var display = entity.display;
    if(typeof display.fillColor === "function"){
        return display.fillColor(entity);
    } else {
        return display.fillColor;
    }
}

function mouseReleased(){
    trailsCanvas2.clear();
}
