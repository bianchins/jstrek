function show_warp_starfield() {
        // get dimensions of window and resize the canvas to fit
        var width = 300,
            height = 300,
            canvas = document.getElementById("canvas"),
            mousex = width/2, mousey = height/2;
        canvas.width = width;
        canvas.height = height;

        // get 2d graphics context and set global alpha
        var G=canvas.getContext("2d");
        G.globalAlpha=0.25;

        // setup aliases
        var Rnd = Math.random,
            Sin = Math.sin,
            Floor = Math.floor;

        // constants and storage for objects that represent star positions
        var warpZ = 12,
            units = 500,
            stars = [],
            cycle = 0,
            Z = 0.025 + (1/25 * 2);

        // requestAnimFrame shim
        window.requestAnimFrame = (function()
        {
           return  window.requestAnimationFrame       || 
                   window.webkitRequestAnimationFrame || 
                   window.mozRequestAnimationFrame    || 
                   window.oRequestAnimationFrame      || 
                   window.msRequestAnimationFrame     || 
                   function(callback)
                   {
                       window.setTimeout(callback);
                   };
        })();

        window.cancelRequestAnimFrame = ( function() {
            return window.cancelAnimationFrame          ||
                window.webkitCancelRequestAnimationFrame    ||
                window.mozCancelRequestAnimationFrame       ||
                window.oCancelRequestAnimationFrame     ||
                window.msCancelRequestAnimationFrame        ||
                clearTimeout
        } )();

        // function to reset a star object
        function resetstar(a)
        {
           a.x = (Rnd() * width - (width * 0.5)) * warpZ;
           a.y = (Rnd() * height - (height * 0.5)) * warpZ;
           a.z = warpZ;
           a.px = 0;
           a.py = 0;
        }

        // initial star setup
        for (var i=0, n; i<units; i++)
        {
           n = {};
           resetstar(n);
           stars.push(n);
        }

        // star rendering anim function
        var rf = function()
        {
           // clear background
           G.fillStyle = "#000";
           G.fillRect(0, 0, width, height);
           
           // mouse position to head towards
           var cx = (mousex - width / 2) + (width / 2),
               cy = (mousey - height / 2) + (height / 2);
           
           // update all stars
           var sat = Floor(Z * 500);       // Z range 0.01 -> 0.5
           if (sat > 100) sat = 100;
           for (var i=0; i<units; i++)
           {
              var n = stars[i],            // the star
                  xx = n.x / n.z,          // star position
                  yy = n.y / n.z,
                  e = (1.0 / n.z + 1) * 2;   // size i.e. z
              
              if (n.px !== 0)
              {
                 // hsl colour from a sine wave
                 G.strokeStyle = "hsl(" + ((cycle * i) % 360) + "," + sat + "%,80%)";
                 G.lineWidth = e;
                 G.beginPath();
                 G.moveTo(xx + cx, yy + cy);
                 G.lineTo(n.px + cx, n.py + cy);
                 G.stroke();
              }
              
              // update star position values with new settings
              n.px = xx;
              n.py = yy;
              n.z -= Z;
              
              // reset when star is out of the view field
              if (n.z < Z || n.px > width || n.py > height)
              {
                 // reset star
                 resetstar(n);
              }
           }
           
           // colour cycle sinewave rotation
           cycle += 0.01;
           
           warp_animation = requestAnimFrame(rf);
        };
        warp_animation = requestAnimFrame(rf);    
      }


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function lineDistance( point1, point2 )
{
    var xs = 0;
    var ys = 0;
     
    xs = point2.x - point1.x;
    xs = xs * xs;
     
    ys = point2.y - point1.y;
    ys = ys * ys;
     
    return Math.sqrt( xs + ys );
}

function clear_communications() {
  $('#communications').html('');
}

function log_communication(message, type) {
  switch(type) {
    case 'alert': $('#communications').prepend('<div class="alert alert-danger" role="alert">[Stardate: '+jstrek.stardate.toFixed(1)+'] '+message+'</div>'); break;
    case 'info': $('#communications').prepend('<div class="alert alert-info" role="alert">[Stardate: '+jstrek.stardate.toFixed(1)+'] '+message+'</div>'); break;
    case 'warning': $('#communications').prepend('<div class="alert alert-warning" role="alert">[Stardate: '+jstrek.stardate.toFixed(1)+'] '+message+'</div>'); break;
    case 'success': $('#communications').prepend('<div class="alert alert-success" role="alert">[Stardate: '+jstrek.stardate.toFixed(1)+'] '+message+'</div>'); break;
  }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}