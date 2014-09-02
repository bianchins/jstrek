
//Variables
var _texture_folder = 'images/texture/';
var jstrek = {};
var warp_animation = null;


function set_system_status(element_selector, value) {
  $(element_selector).css('width', value+'%').attr('aria-valuenow', value); 
}

function Quadrant(y,x,enemies, planets, stars, starbases) {
  this.y = y;
  this.x = x;
  this.enemies = enemies;
  this.planets = planets;
  this.stars = stars;
  this.starbases = starbases;
}

function set_global_status_green()  {
  $('#status').removeClass('label-danger').addClass('label-success').text('GREEN');
}

function set_global_status_alert()  {
  $('#status').removeClass('label-success').addClass('label-danger').text('ALERT');
}

function Sector(y,x,content) {
  this.y = y;
  this.x = x;
  this.content = content;
}

function init() {

  jstrek = {
    enemies: 0,
    galaxy: new Array(8),
    laser_efficency: 100,
    laser_temperature: 0,
    torpedos: 9,
    energy: 100,
    warp: 1.0,
    energyconverter_status: 100,
    shields_status: 100,
    warp_status: 100,
    impulse_status: 100,
    lrs_status: 100,
    stardate: 3500.0,
    actual_quadrant: new Quadrant(0,0,0,0,0,0),
    shields_up: false
  }

  set_global_status_green();

  //Create Empty Galaxy
  for(i=1; i<=8; i++) {
    jstrek.galaxy[i-1] = new Array(8);
  }
  //Popolate Galaxy
  for(y=1; y<=8; y++) {
    for(x=1; x<=8; x++) {
      var enemies = getRandomInt(0, 3) - getRandomInt(0, 2);
      enemies = enemies < 0 ? 0 : enemies;
      jstrek.galaxy[y-1][x-1] = new Quadrant(y,x,enemies, getRandomInt(0, 1), getRandomInt(0, 5), getRandomInt(0, 1));
      jstrek.enemies+=jstrek.galaxy[y-1][x-1].enemies;
    }
  }

  $('#stardate').text(jstrek.stardate.toFixed(1));

  $('#warp-speed').text('1.0');
  $('#enemies').text(jstrek.enemies);

  set_system_status('#energyconverter-status', 100);
  set_system_status('#shields-status', 100);
  set_system_status('#warp-status', 100);
  set_system_status('#impulse-status', 100);
  set_system_status('#lasers-status', 100);
  set_system_status('#torpedos-status', 100);
  set_system_status('#lifesupport-status', 100);
  set_system_status('#srs-status', 100);
  set_system_status('#lrs-status', 100);
  set_system_status('#computer-status', 100);

  set_system_status('#laser-eff', 100);
  set_system_status('#laser-temp', 0);

   var g1= new JustGage({
    id: "energy-meter",
    value: 100,
    min: 0,
    max: 100,
    title: "Energy",
    valueFontColor: '#fff',
    levelColors: ['#FE1600','#F9BC00','#00BC8C']
    }); 
   var g2 = new JustGage({
    id: "shields-meter",
    value: 100,
    min: 0,
    max: 100,
    title: "Shields",
    valueFontColor: '#fff',
    levelColors: ['#FE1600','#F9BC00','#00BC8C']
    }); 

  $('#known-galaxy-chart tbody').html('');
  $('#short-range-chart tbody').html('');

  for(i=1; i<=8; i++) {
        $('#known-galaxy-chart tbody').append('<tr><td>'+i+'</td><td id="g'+i+'-1">...</td><td id="g'+i+'-2">...</td><td id="g'+i+'-3">...</td><td id="g'+i+'-4">...</td><td id="g'+i+'-5">...</td><td id="g'+i+'-6">...</td><td id="g'+i+'-7">...</td><td id="g'+i+'-7">...</td></tr>');
      } 

  for(i=1; i<=8; i++) {
        $('#short-range-chart tbody').append('<tr><td>'+i+'</td><td id="sr1-'+i+'">.</td><td id="sr2-'+i+'">.</td><td id="sr3-'+i+'">.</td><td id="sr4-'+i+'">.</td><td id="sr5-'+i+'">.</td><td id="sr6-'+i+'">.</td><td id="sr7-'+i+'">.</td><td id="sr8-'+i+'">.</td></tr>');
      }  

  $( "#command" ).focus();

}

function command_handler() {
  $( "#command" ).keypress(function( event ) {
    if ( event.which == 13 ) {
      event.preventDefault();
      var command = $( "#command" ).val();
      switch(command) {
        case 'help' : alert('help'); break;
        case 'move' : command_move(getRandomInt(1,8),getRandomInt(1,8),getRandomInt(1,8),getRandomInt(1,8)); break;
        default: alert('Command not recognized');
      }
      //Empty command field
      $( "#command" ).val('');
      //Execute the computer turn
      computer_turn();
    }
  });
}

function hide_planet() {
  try {
    $('#canvas').earth3d('destroy');
  } catch(err) {}
}

function show_planet(texture) {
  $('#canvas').earth3d({
        texture: _texture_folder + texture, // texture used by planet
        defaultSpeed: 5
      });
}

function move_in_quadrant(quadrant_y, quadrant_x) {

    window.clearTimeout();
    window.cancelRequestAnimFrame(warp_animation);
    document.getElementById("canvas").width = document.getElementById("canvas").width;
    hide_planet();

    //Change stardate
    jstrek.stardate+=lineDistance(jstrek.actual_quadrant, jstrek.galaxy[quadrant_y-1][quadrant_x-1])/jstrek.warp;
    $('#stardate').text(jstrek.stardate.toFixed(1));
    //Move in quadrant
    jstrek.actual_quadrant = jstrek.galaxy[quadrant_y-1][quadrant_x-1];

    //Show quadrant in Galaxy Chart
    $('#g'+quadrant_y+'-'+quadrant_x).html(jstrek.galaxy[quadrant_y-1][quadrant_x-1].enemies + '' + jstrek.galaxy[quadrant_y-1][quadrant_x-1].starbases + '' + jstrek.galaxy[quadrant_y-1][quadrant_x-1].stars);
    //Check presence of enemies in actual quadrant
    if(jstrek.galaxy[quadrant_y-1][quadrant_x-1].enemies>0) {
      $('#g'+quadrant_y+'-'+quadrant_x).addClass('text-danger');
      set_global_status_alert();
    } else {
      $('#g'+quadrant_y+'-'+quadrant_x).removeClass('text-danger');
      set_global_status_green();
    }

    //Show actual quadrant coordinates
    $('.quadrant_y').text(quadrant_y);
    $('.quadrant_x').text(quadrant_x);

    //Long Range Scanner (TODO)
    if(jstrek.lrs_status > 50) {
      //LRS works if it is > 50%
    }
    //Move in sector TODO
}

function command_move(quadrant_y, quadrant_x, sector_y, sector_x) {
  if(jstrek.actual_quadrant.y!=quadrant_y || jstrek.actual_quadrant.x!=quadrant_x) {
    

    show_warp_starfield();

    window.setTimeout(function() { move_in_quadrant(quadrant_y, quadrant_x, sector_y, sector_x) }, 500+500*lineDistance(jstrek.actual_quadrant, jstrek.galaxy[quadrant_y-1][quadrant_x-1])/jstrek.warp);

    return;

  }
  //Move in sector TODO
}

function computer_turn() {
  //Execute the computer turn
  //Empty now
}

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
