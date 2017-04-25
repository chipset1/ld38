// game specific util

function rectCenter(entity){
    return createVector(entity.pos.x + entity.dim.x / 2,
                        entity.pos.y + entity.dim.y / 2);
}

function AABBvsAABB(e1, e2){
    // edges for A
    var a_left= e1.pos.x;
    var a_right = e1.pos.x + e1.dim.x;
    var a_top = e1.pos.y;
    var a_bottom = e1.pos.y + e1.dim.y;
    // edges for B
    var b_left= e2.pos.x;
    var b_right = e2.pos.x + e2.dim.x;
    var b_top = e2.pos.y;
    var b_bottom = e2.pos.y + e2.dim.y;

    return a_right >= b_left && a_left <= b_right && a_bottom >= b_top && a_top <= b_bottom;
}

function wrapAroundScreen(sprite, fn){
    // once sprite is right off the screen
    // set the postion to the oposite end of the screen
    if(sprite.pos.x + sprite.dim.x < 0){
        sprite.pos.x = width;
    }
    if(sprite.pos.x > width) {
        sprite.pos.x = -sprite.dim.x;
    }
    if(sprite.pos.y + sprite.dim.y < 0){
        sprite.pos.y = height;
    }
    if(sprite.pos.y > height){
        sprite.pos.y = -sprite.dim.y;
    }
}

function isOffScreen(entity, offset){
    offset = offset || 0;
    var yMin = 0 - offset;
    var yMax = height + offset;
    var xMin = 0 - offset;
    var xMax = width + offset;
    return entity.pos.x < xMin || entity.pos.x > xMax || entity.pos.y < yMin || entity.pos.y > yMax;
}

function limitToBoundary(sprite, xBounds, yBounds){
    // limits the sprites positions based on the x and y bounds provided
    var yMin = yBounds.min;
    var yMax = yBounds.max - sprite.dim.y;
    var xMin = xBounds.min;
    var xMax = xBounds.max - sprite.dim.x;
    // console.log(sprite.dim.y);
    // println(sprite.dim);
    if(sprite.pos.x < xMin){
        sprite.pos.x = xMin;
    }
    if(sprite.pos.x > xMax) {
        sprite.pos.x = xMax;
    }
    if(sprite.pos.y < yMin){
        sprite.pos.y = yMin;
    }
    if(sprite.pos.y > yMax){
        sprite.pos.y = yMax;
    }
}

function wrapAroundCamera(sprite, camera){
    // only wrap sprites past the left of the camera
    if(sprite.pos.x + sprite.dim.x < camera.offsetX) {
        sprite.pos.x = camera.offsetX + width;
    }
}

function removeIfdead(entities){
    for(var i = entities.length - 1; i >= 0; i--){
        if(entities[i].isDead()){
            arrayRemove(entities, i);

        }
    }
}

function SteerBehavior(ms, mf){
    // TODO: maybe refactor this to be a closure
    var maxSpeed = ms || 1.5;// * 60;
    var maxForce = mf || 0.15;// * 60;

    this.wander = function(entity, angle, wanderR, wanderD){
        // var angleYScale = 1;
        wanderR = wanderR || 100;
        wanderD = wanderD || 150;
        var periodScale = 0.01;
        var circle = entity.vel.copy(); //position of circle
        circle.normalize();
        circle.mult(wanderD);
        circle.add(entity.pos);

        var circleOffset = createVector();
        // var angle = millis() * periodScale;
        circleOffset.x = wanderR*cos(angle);
        circleOffset.y = wanderR*sin(angle);
        var target = createVector();
        target.x = circle.x + circleOffset.x;
        target.y = circle.y + circleOffset.y;
        this.seek(entity, target);
    };

    this.arrive = function(entity, target, distance){
        let desired = target.copy().sub(entity.pos);
        let d = desired.mag();
        desired.normalize();
        if(d < distance){
            desired.mult(map(d, 100, 0, maxSpeed, 0));
        } else {
            desired.mult(maxSpeed);
        }

        var steer = desired.sub(entity.vel);
        steer.limit(maxForce);
        // steer.mult(-1);
        entity.acc.add(steer);
    };

    this.seek = function(entity, target){
        // entity is a object that has a vel and acc
        // come up with better name
        var desired = target.copy().sub(entity.pos);
        desired.normalize();
        desired.mult(maxSpeed);

        var steer = desired.sub(entity.vel);
        steer.limit(maxForce);
        // steer.mult(-1);
        entity.acc.add(steer);
    };

    this.separate = function(entity, seekers, desiredSeparation){
        // var desiredSeparation = 20;
        var sum = createVector();
        var count = 0;
        // For every boid in the system, check if it's too close
        seekers.forEach(function(other){
            var d = entity.pos.copy().dist(other.pos);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredSeparation)) {
                // Calculate vector pointing away from neighbor
                var diff = entity.pos.copy().sub(other.pos);
                diff.normalize();
                diff.div(d);        // Weight by distance
                sum.add(diff);
                count++;            // Keep track of how many
            }
            // Average -- divide by how many
            if (count > 0) {
                sum.div(count);
                // Our desired vector is the average scaled to maximum speed
                sum.normalize();
                sum.mult(maxSpeed);
                // Implement Reynolds: Steering = Desired - Velocity
                var steer = sum.sub(entity.vel);
                steer.limit(maxForce);
                entity.acc.add(steer);
            }
        });
    };
}

function removeIfdead(entities) {
    for(var i = entities.length - 1; i >= 0; i--){
        var e = entities[i];
        if(e.isDead && e.isDead(e)){
            arrayRemove(entities, i);
        }
    }
}

function isOffScreen(entity, offset){
    offset = offset || 0;
    var yMin = 0 - offset;
    var yMax = height + offset;
    var xMin = 0 - offset;
    var xMax = width + offset;
    return entity.pos.x < xMin || entity.pos.x > xMax || entity.pos.y < yMin || entity.pos.y > yMax;
}
