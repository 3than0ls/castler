module.exports = {
    playerObjectCollisionHandle: function(player, object) {
        let magnitude, combinedRadii, overlap, vx, vy, dx, dy, s = {}, hit = false;

        vx = object.globalX - player.globalX;
        vy = object.globalY - player.globalY;
          
      
        //Find the distance between the circles by calculating the vector's magnitude (how long the vector is)
        magnitude = Math.sqrt(vx * vx + vy * vy);
      
        //Add together the circles' combined half-widths
        combinedRadii = player.size[0]/2 + object.size[0]/2; // edited this line
      
          //Figure out if there's a collision
          if (magnitude < combinedRadii) {
      
            //Yes, a collision is happening
            hit = true;
      
            //Find the amount of overlap between the circles
            overlap = combinedRadii - magnitude;
            
            let quantumPadding = 0.3;
            overlap += quantumPadding;
      
            //Normalize the vector
            //These numbers tell us the direction of the collision
            dx = vx / magnitude;
            dy = vy / magnitude;
      
            // rather than moving circle 1 out of collision, we add the overlap muliplied by the vector to the player collision values
            // has an issue where if user unfocuses and an entity runs into the player, the overlap causes the player to teleport to other places
            player.collisionvx -= (overlap * dx);
            player.collisionvy -= (overlap * dy);

            return hit;
        }
    },

    entityObjectCollisionHandle: function(entity, object, io) {
        let magnitude, combinedRadii, overlap, vx, vy, dx, dy, s = {}, hit = false;

        vx = object.globalX - entity.globalX;
        vy = object.globalY - entity.globalY;
          
      
        //Find the distance between the circles by calculating the vector's magnitude (how long the vector is)
        magnitude = Math.sqrt(vx * vx + vy * vy);
      
        combinedRadii = entity.size[0]/2 + object.size[0]/2 + entity.avoidPaddingDistance/2;
      
          //Figure out if there's a collision
          if (magnitude < combinedRadii) {
      
            hit = true;
      
            //Find the amount of overlap between the circles
            overlap = combinedRadii - magnitude;
            
            let quantumPadding = 0.3;
            overlap += quantumPadding;
      
            //Normalize the vector
            //These numbers tell us the direction of the collision
            dx = vx / magnitude;
            dy = vy / magnitude;
      
            // rather than moving circle 1 out of collision, we add the overlap muliplied by the vector to the player collision values
            // has an issue where if user unfocuses and an entity runs into the player, the overlap causes the player to teleport to other places
            entity.collisionvx += (overlap * dx);
            entity.collisionvy += (overlap * dy);

            if (entity.hit) {
                if (entity.attackTick >= entity.attackSpeed) {
                    object.health -= entity.damage;
                    entity.attackTick = 0;
                    
                    let a = object.globalX - entity.globalX;
                    let b = object.globalY - entity.globalY;
                    let vx = (Math.asin(a / Math.hypot(a, b))*10);
                    let vy = (Math.asin(b / Math.hypot(a, b))*10);
                    io.emit('hit', {
                        vx: vx,
                        vy: vy,
                        collisionX: a/2,
                        collisionY: b/2,
                        structureID: object.structureID,
                        // harvestSpeed: this.harvestSpeed
                    });
                }
            }

            return hit;
        }
    },

    collisionPointObject(collisionPoints, object) {
        let vx, vy, magnitude;
        let objectGlobalX = object.globalX;
        let objectGlobalY = object.globalY;
        /*if (!object.hasOwnProperty('globalX') && !object.hasOwnProperty('globalY')) { // if it is an entity (which we can tell if it has the global positioning property), 
            objectGlobalX = object.entityState.globalX;  // then use the entity state to access the position
            object.globalY = object.entityState.globalY;
        }*/
        vx = collisionPoints.x - objectGlobalX;
        vy = collisionPoints.y - objectGlobalY;
        magnitude = Math.sqrt(vx * vx + vy * vy);

        return magnitude < object.size[0]/2;
    }
}