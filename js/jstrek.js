
//Variables
var _texture_folder = 'images/texture/';
var jstrek = {};
var warp_animation = null;
var initial_turn = true;
var energy_meter_gauge = null;
var shields_meter_gauge = null;


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
  this.sectors = new Array(8);
  //Populate the quadrant with all empty sectors 
  for(y=1; y<=8; y++) {
    this.sectors[y-1] = new Array(8);
    for(x=1; x<=8; x++) {
      this.sectors[y-1][x-1] = new Sector(y,x,null);
    }
  }
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

  $('#main-container').removeClass('hide');

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
    actual_sector: new Sector(0,0,null),
    shields_up: false
  }

  set_global_status_green();

  //Popolate Galaxy
  for(y=1; y<=8; y++) {
    jstrek.galaxy[y-1] = new Array(8);
    for(x=1; x<=8; x++) {
      var enemies = getRandomInt(0, 3) - getRandomInt(0, 2);
      enemies = enemies < 0 ? 0 : enemies;
      jstrek.galaxy[y-1][x-1] = new Quadrant(y,x,enemies, getRandomInt(1, 2)-1, getRandomInt(0, 5), getRandomInt(1, 2)-1);
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

   energy_meter_gauge= new JustGage({
    id: "energy-meter",
    value: 100,
    min: 0,
    max: 100,
    title: "Energy",
    valueFontColor: '#fff',
    levelColors: ['#FE1600','#F9BC00','#00BC8C']
    }); 
   shields_meter_gauge = new JustGage({
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
        $('#known-galaxy-chart tbody').append('<tr><td>'+i+'</td><td id="g'+i+'-1">...</td><td id="g'+i+'-2">...</td><td id="g'+i+'-3">...</td><td id="g'+i+'-4">...</td><td id="g'+i+'-5">...</td><td id="g'+i+'-6">...</td><td id="g'+i+'-7">...</td><td id="g'+i+'-8">...</td></tr>');
      } 

  for(i=1; i<=8; i++) {
        $('#short-range-chart tbody').append('<tr><td>'+i+'</td><td id="sr'+i+'-1">.</td><td id="sr'+i+'-2">.</td><td id="sr'+i+'-3">.</td><td id="sr'+i+'-4">.</td><td id="sr'+i+'-5">.</td><td id="sr'+i+'-6">.</td><td id="sr'+i+'-7">.</td><td id="sr'+i+'-8">.</td></tr>');
      }  

  move_in_quadrant(getRandomInt(1,8),getRandomInt(1,8),getRandomInt(1,8),getRandomInt(1,8));     

  $( "#command" ).focus();

}

function set_warp_speed(speed) {
  var max_warp_speed = (1+0.09*jstrek.warp_status);
  if(speed > 1 && speed <= max_warp_speed) {
    jstrek.warp = speed;
    $('#warp-speed').text(jstrek.warp.toFixed(1));
  } else {
    bootbox.alert("Enter Warp Speed between 1.0 and " + max_warp_speed);
  }
}

function command_handler() {
  $( "#command" ).keypress(function( event ) {
    if ( event.which == 13 ) {
      event.preventDefault();
      var command = $( "#command" ).val();
      switch(command) {
        case 'help':
        case 'h':
        case 'H':
        case 'HELP': alert('help'); break;
        case 'move':
        case 'm':
        case 'M':
        case 'MOVE': 
                      bootbox.prompt("Enter Quadrant, Sector", function(result) {
                        if (result === null) {
                        
                        } else {
                          var coord_array = result.split(',');
                          if(coord_array.length==2) {
                            move_in_sector(coord_array[0],coord_array[1]);
                          }
                          if(coord_array.length==4) {
                            command_move(coord_array[0],coord_array[1],coord_array[2],coord_array[3]); 
                          }
                        }
                        $( "#command" ).val('');
                      });
                      break;
        case 'warp':
        case 'w':
        case 'W':
        case 'WARP': 
                      bootbox.prompt("Enter Warp Speed", function(result) {
                        if (result === null) {
                        
                        } else {
                          try {
                            set_warp_speed(parseFloat(result));
                          } catch(err) {
                            //Warp not correct
                          }
                          
                        }
                        $( "#command" ).val('');
                      });
                      break;    
        case 'ack':
        case 'a':
        case 'A':
        case 'ACK': clear_communications(); break;                        
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

function add_stardate(stardays) {
  jstrek.stardate+=stardays;
  $('#stardate').text(jstrek.stardate.toFixed(1));
}

function move_in_quadrant(quadrant_y, quadrant_x, sector_y, sector_x) {
    try {
      window.clearTimeout();
      window.cancelRequestAnimFrame(warp_animation);
      document.getElementById("canvas").width = document.getElementById("canvas").width;
      hide_planet();
    } catch(err) {}
    
    if(!initial_turn) {
      //Change stardate
      add_stardate(lineDistance(jstrek.actual_quadrant, jstrek.galaxy[quadrant_y-1][quadrant_x-1])/jstrek.warp);

      //Calculate energy waste
      var energy_wasted = Math.floor(lineDistance(jstrek.actual_quadrant, jstrek.galaxy[quadrant_y-1][quadrant_x-1]) * jstrek.warp / 2);
      
      jstrek.energy-=energy_wasted;

      energy_meter_gauge.refresh(jstrek.energy);

    } 
    
    //Move in quadrant
    jstrek.actual_quadrant = jstrek.galaxy[quadrant_y-1][quadrant_x-1];

    //Show quadrant in Galaxy Chart
    $('#g'+quadrant_y+'-'+quadrant_x).html(jstrek.galaxy[quadrant_y-1][quadrant_x-1].enemies + '' + jstrek.galaxy[quadrant_y-1][quadrant_x-1].starbases + '' + jstrek.galaxy[quadrant_y-1][quadrant_x-1].stars);
    //Check presence of enemies in actual quadrant
    if(jstrek.galaxy[quadrant_y-1][quadrant_x-1].enemies>0) {
      $('#g'+quadrant_y+'-'+quadrant_x).removeClass('text-success').addClass('text-danger');
      set_global_status_alert();
    } else {
      $('#g'+quadrant_y+'-'+quadrant_x).removeClass('text-danger').addClass('text-success');
      set_global_status_green();
    }

    //Show actual quadrant coordinates
    $('.quadrant_y').text(quadrant_y);
    $('.quadrant_x').text(quadrant_x);

    //Long Range Scanner (TODO)
    if(jstrek.lrs_status > 50) {
      //LRS works if it is > 50%
    }

    //Populating sector
    //Stars
    for(i=0; i<jstrek.actual_quadrant.stars; i++) {
      var positioned = false;
      while(!positioned) {
        var x = getRandomInt(1,8);
        var y = getRandomInt(1,8);
        if(jstrek.actual_quadrant.sectors[y-1][x-1].content==null) {
          jstrek.actual_quadrant.sectors[y-1][x-1].content = '*';
          $('#sr'+y+'-'+x).html('<span class="text-warning"><span class="fa fa-asterisk"></span></span>');
          positioned = true;
        }
      }
    }

    //Planets
    for(i=0; i<jstrek.actual_quadrant.planets; i++) {
      var positioned = false;
      while(!positioned) {
        var x = getRandomInt(1,8);
        var y = getRandomInt(1,8);
        if(jstrek.actual_quadrant.sectors[y-1][x-1].content==null) {
          jstrek.actual_quadrant.sectors[y-1][x-1].content = 'p';
          $('#sr'+y+'-'+x).html('<span class="text-info"><span class="fa fa-globe"></span></span>');
          positioned = true;
        }
      }
    }

    //Starbases
    for(i=0; i<jstrek.actual_quadrant.starbases; i++) {
      var positioned = false;
      while(!positioned) {
        var x = getRandomInt(1,8);
        var y = getRandomInt(1,8);
        if(jstrek.actual_quadrant.sectors[y-1][x-1].content==null) {
          jstrek.actual_quadrant.sectors[y-1][x-1].content = 'b';
          $('#sr'+y+'-'+x).html('<span class="text-success">SB</span>');
          positioned = true;
        }
      }
    }

    //Move in sector
    move_in_sector(sector_y, sector_x);
}

function clear_communications() {
  $('#communications').html('');
}

function log_communication(message, type) {
  switch(type) {
    case 'alert': $('#communications').prepend('<div class="alert alert-danger" role="alert">'+message+'</div>'); break;
    case 'info': $('#communications').prepend('<div class="alert alert-info" role="alert">'+message+'</div>'); break;
    case 'warning': $('#communications').prepend('<div class="alert alert-warning" role="alert">'+message+'</div>'); break;
    case 'success': $('#communications').prepend('<div class="alert alert-success" role="alert">'+message+'</div>'); break;
  }
}

function move_in_sector(sector_y, sector_x) {
  if(jstrek.actual_quadrant.sectors[sector_y-1][sector_x-1].content!=null) {
    //Sector busy
    log_communication('Moving in '+sector_y+','+sector_x+': the sector is busy!','info');
  } else {
    //Sector free, moving
    $('.sector_y').text(sector_y);
    $('.sector_x').text(sector_x);
    if(!initial_turn) {
      add_stardate(lineDistance(jstrek.actual_sector, jstrek.actual_quadrant.sectors[sector_y-1][sector_x-1])/10);
    }

    jstrek.actual_sector.content = null;
    $('#sr'+jstrek.actual_sector.y+'-'+jstrek.actual_sector.x).html('.');
    jstrek.actual_sector = jstrek.actual_quadrant.sectors[sector_y-1][sector_x-1];
    jstrek.actual_quadrant.sectors[sector_y-1][sector_x-1].content = 's';
    var ship_image = (jstrek.shields_up) ? 'lexington_su.png' : 'lexington.png';
    $('#sr'+sector_y+'-'+sector_x).html('<img src="images/'+ship_image+'"/>');
    if(initial_turn) {
      log_communication('Welcome aboard!','success');
    }

  }
  initial_turn = false;
}

function command_move(quadrant_y, quadrant_x, sector_y, sector_x) {
  if(jstrek.actual_quadrant.y!=quadrant_y || jstrek.actual_quadrant.x!=quadrant_x) {
    

    show_warp_starfield();

    window.setTimeout(function() { move_in_quadrant(quadrant_y, quadrant_x, sector_y, sector_x) }, 500+500*lineDistance(jstrek.actual_quadrant, jstrek.galaxy[quadrant_y-1][quadrant_x-1])/jstrek.warp);

    return;

  } else {
    //Already in Quadrant, move in sector
    move_in_sector(sector_y, sector_x);
  }
  
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
