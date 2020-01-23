module.exports = {
    playerObjectCollisionHandle: function(player, object) {
        let magnitude, combinedRadii, overlap, vx, vy, dx, dy, s = {}, hit = false;

        vx = object.globalX - player.globalX;
        vy = object.globalY - player.globalY;
          
      
        //Find the distance between the circles by calculating the vector's magnitude (how long the vector is)
        magnitude = Math.sqrt(vx * vx + vy * vy);
      
        //Add together the circles' combined half-widths
        combinedRadii = player.radius + object.size[0]/2; // edited this line
      
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
    }
}