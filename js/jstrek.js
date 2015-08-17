
//Variables
var _texture_folder = 'images/texture/';
var jstrek = {};
var warp_animation = null;
var initial_turn = true;
var energy_meter_gauge = null;
var shields_meter_gauge = null;
var command_done = false;

var debug = false;
if(debug) {
    window.onerror = function(error, url, line) {
        console.log('Error: '+error+' in line '+line+', '+url);
    };
}

document.onkeydown = checkKey;


function set_system_status(element_selector, value) {
  if(value < 30) {
      $(element_selector).removeClass('progress-bar-warning').removeClass('progress-bar-success').addClass('progress-bar-danger');
  } 
  if(value < 50 && value >= 30) {
      $(element_selector).removeClass('progress-bar-danger').removeClass('progress-bar-success').addClass('progress-bar-warning');
  } 
  if(value >= 50) {
      $(element_selector).removeClass('progress-bar-danger').removeClass('progress-bar-warning').addClass('progress-bar-success');
  }
  $(element_selector).css('width', value+'%').attr('aria-valuenow', value); 
}

function set_global_status_green()  {
  $('#status').removeClass('label-danger').addClass('label-success').text('GREEN');
}

function set_global_status_alert()  {
  $('#status').removeClass('label-success').addClass('label-danger').text('ALERT');
}

function shields_up() {
 if(!jstrek.shields_up && jstrek.shields>0) {
          jstrek.shields_up = true;
          $('#sr'+jstrek.actual_sector.y+'-'+jstrek.actual_sector.x).html('<img src="images/lexington_su.png"/>');
          log_communication('Shields Up, Sir.','success');
          command_done = true;
        }
}

function shields_down() {
  if(jstrek.shields_up) {
          jstrek.shields_up = false;
          $('#sr'+jstrek.actual_sector.y+'-'+jstrek.actual_sector.x).html('<img src="images/lexington.png"/>');
          log_communication('Shields Down, Sir.','success');
          command_done = true;
        }
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow, shields up
       shields_up();
    }
    else if (e.keyCode == '40') {
        // down arrow, shields down
        shields_down();
    }
}

function restore_shields() {
  jstrek.shields = 100;
  shields_meter_gauge.refresh(100);
}

function refresh_systems() {
  set_system_status('#energyconverter-status', jstrek.energyconverter_status);
  set_system_status('#shields-status', jstrek.shields_status);
  set_system_status('#warp-status', jstrek.warp_status);
  set_system_status('#impulse-status', jstrek.impulse_status);
  set_system_status('#lasers-status', jstrek.lasers_status);
  set_system_status('#torpedos-status', jstrek.torpedo_status);
  set_system_status('#lifesupport-status', jstrek.lifesupport_status);
  set_system_status('#srs-status', jstrek.srs_status);
  set_system_status('#lrs-status', jstrek.lrs_status);
  set_system_status('#computer-status', 100);
  for(i=1; i<=jstrek.torpedos; i++) {
    $('#torp'+i).addClass('text-danger').removeClass('text-muted');
  }
  shields_meter_gauge.refresh(jstrek.shields);
  energy_meter_gauge.refresh(jstrek.energy);
}

var system_array = ['energyconverter_status','shields_status', 'warp_status','impulse_status','lrs_status', 'laser_status', 'torpedo_status','lifesupport_status','srs_status'];

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
    shields : 100,
    energyconverter_status: 100,
    shields_status: 100,
    warp_status: 100,
    impulse_status: 100,
    lrs_status: 100,
    lasers_status: 100,
    torpedo_status: 100,
    lifesupport_status: 100,
    srs_status: 100,
    stardate: 3500.0,
    actual_quadrant: new Quadrant(0,0,0,0,0,0),
    actual_sector: new Sector(0,0,null),
    shields_up: false,
    game_points: 0,
    torpedo_damage_power: 120
  }

  set_global_status_green();

  //Popolate Galaxy
  for(y=1; y<=8; y++) {
    jstrek.galaxy[y-1] = new Array(8);
    for(x=1; x<=8; x++) {
      var enemies = getRandomInt(0, 3) - getRandomInt(0, 2);
      enemies = enemies < 0 ? 0 : enemies;
      jstrek.galaxy[y-1][x-1] = new Quadrant(y,x,enemies, getRandomInt(0, 2), getRandomInt(0, 7), getRandomInt(0, 2));
      jstrek.enemies+=jstrek.galaxy[y-1][x-1].enemies.length;
    }
  }

  $('#stardate').text(jstrek.stardate.toFixed(1));

  $('#warp-speed').text('1.0');
  $('#enemies').text(jstrek.enemies);

  

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

  refresh_systems();

  for(i=1; i<=8; i++) {
        $('#known-galaxy-chart tbody').append('<tr><td>'+i+'</td><td id="g'+i+'-1" class="lrc_cell" data-y="'+i+'" data-x="1">...</td><td id="g'+i+'-2" class="lrc_cell" data-y="'+i+'" data-x="2">...</td><td id="g'+i+'-3" class="lrc_cell" data-y="'+i+'" data-x="3">...</td><td id="g'+i+'-4" class="lrc_cell" data-y="'+i+'" data-x="4">...</td><td id="g'+i+'-5" class="lrc_cell" data-x="5">...</td><td id="g'+i+'-6" class="lrc_cell" data-y="'+i+'" data-x="6">...</td><td id="g'+i+'-7" class="lrc_cell" data-y="'+i+'" data-x="7">...</td><td id="g'+i+'-8" class="lrc_cell" data-y="'+i+'" data-x="8">...</td></tr>');
      } 

  $('.lrc_cell').click(function(){
      
        command_move(parseInt($(this).attr('data-y')),parseInt($(this).attr('data-x')),1,1);
  });

  for(i=1; i<=8; i++) {
        $('#short-range-chart tbody').append('<tr><td>'+i+'</td><td id="sr'+i+'-1" class="src_cell" data-y="'+i+'" data-x="1">.</td><td id="sr'+i+'-2" class="src_cell" data-y="'+i+'" data-x="2">.</td><td id="sr'+i+'-3" class="src_cell" data-y="'+i+'" data-x="3">.</td><td id="sr'+i+'-4" class="src_cell" data-y="'+i+'" data-x="4">.</td><td id="sr'+i+'-5" class="src_cell" data-y="'+i+'" data-x="5">.</td><td id="sr'+i+'-6" class="src_cell" data-y="'+i+'" data-x="6">.</td><td id="sr'+i+'-7" class="src_cell" data-y="'+i+'" data-x="7">.</td><td id="sr'+i+'-8" class="src_cell" data-y="'+i+'" data-x="8">.</td></tr>');
  }
  
  //Every minute, crew repair systems and the energy converter produces energy
  setInterval(function(){ 
      cron_repair();
  }, 60000);
  
  move_in_quadrant(getRandomInt(1,8),getRandomInt(1,8),getRandomInt(1,8),getRandomInt(1,8));     

  focus_on_command();



}

function focus_on_command() {
  //Empty command field
  $( "#command" ).val('');
  setTimeout(function(){
    $("#command").focus();
  }, 0);
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
        case 'HELP': 
            bootbox.alert("Enter:<br> 'O' to orbit near a planet<br/> 'D' to dock a Space Station<br/> 'M' to move the ship<br/> 'W' to change warp speed<br/> 'T' to use torpedos (weapons)", function() {
                focus_on_command();
            });
            break;
        case 'orbit':
        case 'o':
        case 'O':
        case 'ORBIT':
                    //Search for planets near 
                    result = search_planet_near();
                    if(result!=null) {
                      //Get info about planet
                      log_communication('<strong>Ship is now in orbit with planet: '+result.name+'</strong><br/>Energy crystal on surface: '+result.contain_energy+'<br/>Intelligent life forms: '+result.contain_people, 'info');
                      computer_turn();
                    }
                    break;
        case 'dock':
        case 'd':
        case 'D':
        case 'DOCK':
                    //Search for starbase near 
                    result = search_starbase_near();
                    if(result!=null) {
                      //Get info about starbase
                      log_communication('<strong>The Admiral of Starbase '+result.name+' greetings us.</strong>', 'info');
                      jstrek.energy=100;
                      energy_meter_gauge.refresh(jstrek.energy);
                      restore_shields();
                      for(i=0; i<system_array.length;i++) {
                        jstrek[system_array[i]] = 100;
                      }
                      jstrek.torpedos = 9;
                      refresh_systems();
                      computer_turn();
                    }
                    break;                    
        case 'move':
        case 'm':
        case 'M':
        case 'MOVE': 
                      bootbox.prompt("Enter Quadrant, Sector", function(result) {
                        if (result === null) {
                        
                        } else {
                          var coord_array = result.split(',');
                          if(coord_array.length==2) {
                            if(move_in_sector(coord_array[0],coord_array[1])) {
                              computer_turn();
                            }
                          }
                          if(coord_array.length==4) {
                            command_move(parseInt(coord_array[0]),parseInt(coord_array[1]),parseInt(coord_array[2]),parseInt(coord_array[3]));
                          }
                        }
                        focus_on_command();
                      });
                      break;
        case 'torp':
        case 't':
        case 'T':
        case 'TORP':
                    if(jstrek.torpedo_status>=50) {
                     bootbox.prompt("How many torpedos?", function(result) {
                        if (result !== null) {
                          var num = parseInt(result);
                          if(num>jstrek.torpedos) {
                            log_communication('We have not enought torpedos!','warning');
                            return;
                          }
                          for(i=1; i<=num; i++) {
                            bootbox.prompt("Coords for torpedo #"+i, function(result) {
                              if(result!==null) {
                                var coord_array = result.split(',');
                                if(coord_array.length==2) {
                                  torpedo_shoot(jstrek.actual_quadrant.sectors[parseInt(coord_array[0])-1][parseInt(coord_array[1])-1], (i==num));
                                }
                              }
                            });
                          }
                        }
                        focus_on_command();
                      }); 
                    } else {
                        bootbox.alert('Sorry, Sir. Torpedo\'s system is under 50%. We can\'t use them.',function() {
                            focus_on_command(); 
                        });
                    }
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
                            computer_turn();
                          } catch(err) {
                            //Warp not correct
                          }
                          
                        }
                        focus_on_command();
                      });
                      break;    
        case 'ack':
        case 'a':
        case 'A':
        case 'ACK': clear_communications(); break;                        
        default: alert('Command not recognized');
      }
      focus_on_command();
    }
  });
}

function hide_planet() {
  $('#canvas').css('background','url("images/texture/StarsMap_2500x1250.jpg")'); 
}

function show_planet(texture) {
  $('#canvas').css('background','url("images/texture/'+texture+'") no-repeat');
}

function add_stardate(stardays) {
  jstrek.stardate+=stardays;
  $('#stardate').text(jstrek.stardate.toFixed(1));
}

function search_planet_near() {
  var y = jstrek.actual_sector.y - 1;
  var x = jstrek.actual_sector.x - 1;
  try {
    if(jstrek.actual_quadrant.sectors[y-1][x-1].content instanceof Planet) return jstrek.actual_quadrant.sectors[y-1][x-1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y-1][x].content instanceof Planet) return jstrek.actual_quadrant.sectors[y-1][x].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y-1][x+1].content instanceof Planet) return jstrek.actual_quadrant.sectors[y-1][x+1].content;
  } catch(err) {}  
  try {  
    if(jstrek.actual_quadrant.sectors[y][x-1].content instanceof Planet) return jstrek.actual_quadrant.sectors[y][x-1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y][x+1].content instanceof Planet) return jstrek.actual_quadrant.sectors[y][x+1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y+1][x-1].content instanceof Planet) return jstrek.actual_quadrant.sectors[y+1][x-1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y+1][x].content instanceof Planet) return jstrek.actual_quadrant.sectors[y+1][x].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y+1][x+1].content instanceof Planet) return jstrek.actual_quadrant.sectors[y+1][x+1].content;
  } catch(err) {}
    
  return null;
}

function search_starbase_near() {
  var y = jstrek.actual_sector.y - 1;
  var x = jstrek.actual_sector.x - 1;
  try {
    if(jstrek.actual_quadrant.sectors[y-1][x-1].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y-1][x-1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y-1][x].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y-1][x].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y-1][x+1].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y-1][x+1].content;
  } catch(err) {}  
  try {  
    if(jstrek.actual_quadrant.sectors[y][x-1].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y][x-1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y][x+1].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y][x+1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y+1][x-1].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y+1][x-1].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y+1][x].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y+1][x].content;
  } catch(err) {}
  try {
    if(jstrek.actual_quadrant.sectors[y+1][x+1].content instanceof Starbase) return jstrek.actual_quadrant.sectors[y+1][x+1].content;
  } catch(err) {}
    
  return null;
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

      $('#short-range-chart tbody').html('');

      for(i=1; i<=8; i++) {
        $('#short-range-chart tbody').append('<tr><td>'+i+'</td><td id="sr'+i+'-1" class="src_cell" data-y="'+i+'" data-x="1">.</td><td id="sr'+i+'-2" class="src_cell" data-y="'+i+'" data-x="2">.</td><td id="sr'+i+'-3" class="src_cell" data-y="'+i+'" data-x="3">.</td><td id="sr'+i+'-4" class="src_cell" data-y="'+i+'" data-x="4">.</td><td id="sr'+i+'-5" class="src_cell" data-y="'+i+'" data-x="5">.</td><td id="sr'+i+'-6" class="src_cell" data-y="'+i+'" data-x="6">.</td><td id="sr'+i+'-7" class="src_cell" data-y="'+i+'" data-x="7">.</td><td id="sr'+i+'-8" class="src_cell" data-y="'+i+'" data-x="8">.</td></tr>');
      } 

    } 
    
    //Move in quadrant
    jstrek.actual_quadrant = jstrek.galaxy[quadrant_y-1][quadrant_x-1];

    //Show quadrant in Galaxy Chart
    show_quadrant(quadrant_y, quadrant_x, true);

    //Show actual quadrant coordinates
    $('.quadrant_y').text(quadrant_y);
    $('.quadrant_x').text(quadrant_x);

    //Long Range Scanner
    if(jstrek.lrs_status > 50) {
      //LRS works if it is > 50%
      show_quadrant(quadrant_y-1, quadrant_x-1, false);
      show_quadrant(quadrant_y-1, quadrant_x, false);
      show_quadrant(quadrant_y-1, quadrant_x+1, false);  
      show_quadrant(quadrant_y+1, quadrant_x-1, false);
      show_quadrant(quadrant_y+1, quadrant_x, false);
      show_quadrant(quadrant_y+1, quadrant_x+1, false);
      show_quadrant(quadrant_y, quadrant_x-1, false);
      show_quadrant(quadrant_y, quadrant_x+1, false);     
    } else {
        show_quadrant_if_lrs_is_damaged(quadrant_y-1, quadrant_x-1);
        show_quadrant_if_lrs_is_damaged(quadrant_y-1, quadrant_x);
        show_quadrant_if_lrs_is_damaged(quadrant_y-1, quadrant_x+1);  
        show_quadrant_if_lrs_is_damaged(quadrant_y+1, quadrant_x-1);
        show_quadrant_if_lrs_is_damaged(quadrant_y+1, quadrant_x);
        show_quadrant_if_lrs_is_damaged(quadrant_y+1, quadrant_x+1);
        show_quadrant_if_lrs_is_damaged(quadrant_y, quadrant_x-1);
        show_quadrant_if_lrs_is_damaged(quadrant_y, quadrant_x+1); 
    }

    move_in_sector(sector_y, sector_x);

    if(jstrek.srs_status<=50) {
        //Short Range Scanner doesn't work!
        $('#short-range-chart tbody').html('');

        for(i=1; i<=8; i++) {
          $('#short-range-chart tbody').append('<tr><td>'+i+'</td><td id="sr'+i+'-1" class="src_cell" data-y="'+i+'" data-x="1">?</td><td id="sr'+i+'-2" class="src_cell" data-y="'+i+'" data-x="2">?</td><td id="sr'+i+'-3" class="src_cell" data-y="'+i+'" data-x="3">?</td><td id="sr'+i+'-4" class="src_cell" data-y="'+i+'" data-x="4">?</td><td id="sr'+i+'-5" class="src_cell" data-y="'+i+'" data-x="5">?</td><td id="sr'+i+'-6" class="src_cell" data-y="'+i+'" data-x="6">?</td><td id="sr'+i+'-7" class="src_cell" data-y="'+i+'" data-x="7">?</td><td id="sr'+i+'-8" class="src_cell" data-y="'+i+'" data-x="8">?</td></tr>');
        }
        
        var ship_image = (jstrek.shields_up) ? 'lexington_su.png' : 'lexington.png';
        $('#sr'+sector_y+'-'+sector_x).html('<img src="images/'+ship_image+'"/>');
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
          if(jstrek.srs_status>50) {
            $('#sr'+y+'-'+x).html('<span class="text-warning"><span class="fa fa-asterisk"></span></span>');
          } else {
            $('#sr'+y+'-'+x).html('?');  
          }
          positioned = true;
        }
      }
    }

    //Enemies
    for(i=0; i<jstrek.actual_quadrant.enemies.length; i++) {
      var positioned = false;
      while(!positioned) {
        var x = getRandomInt(1,8);
        var y = getRandomInt(1,8);
        if(jstrek.actual_quadrant.sectors[y-1][x-1].content==null) {
          jstrek.actual_quadrant.enemies[i].y = y;
          jstrek.actual_quadrant.enemies[i].x = x;
          jstrek.actual_quadrant.sectors[y-1][x-1].content = jstrek.actual_quadrant.enemies[i];
          if(jstrek.srs_status>50) {
            $('#sr'+y+'-'+x).html('<img src="images/mongol'+jstrek.actual_quadrant.enemies[i].type+'.png"/>');
          } else {
            $('#sr'+y+'-'+x).html('?');  
          }
          positioned = true;
        }
      }
    }

    //Planets
    for(i=0; i<jstrek.actual_quadrant.planets.length; i++) {
      var positioned = false;
      while(!positioned) {
        var x = getRandomInt(1,8);
        var y = getRandomInt(1,8);
        if(jstrek.actual_quadrant.sectors[y-1][x-1].content==null) {
          jstrek.actual_quadrant.sectors[y-1][x-1].content = jstrek.actual_quadrant.planets[i];
          if(jstrek.srs_status>50) {
            $('#sr'+y+'-'+x).html('<span class="text-info"><span class="fa fa-globe"></span></span>');
          } else {
            $('#sr'+y+'-'+x).html('?');  
          }
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
          jstrek.actual_quadrant.sectors[y-1][x-1].content = new Starbase(chance.syllable(), getRandomInt(1,3));
          if(jstrek.srs_status>50) {
            $('#sr'+y+'-'+x).html('<img src="images/starbase.png"/>');
          } else {
            $('#sr'+y+'-'+x).html('?');  
          }
          positioned = true;
        }
      }
    }
    
    //If user clicks on a sector, ship moves in it
    $('.src_cell').click(function(e) {
        //Check impulse engine
        if(jstrek.impulse_status>30) {  
            if($(this).attr('data-y')!=jstrek.actual_sector.y || $(this).attr('data-x')!=jstrek.actual_sector.x) {
                if(move_in_sector($(this).attr('data-y'),$(this).attr('data-x'))) {
                    computer_turn();
                }
            }
        } else {
            bootbox.alert('Sorry, Sir. Impulse Engine are damaged! We can\'t move in another sector',function() {focus_on_command();});
        }
    });

    //Execute the computer turn
    computer_turn();

}

function show_quadrant_if_lrs_is_damaged(quadrant_y, quadrant_x) {
    $('#g'+quadrant_y+'-'+quadrant_x).html('<b>???</b>');
}

function show_quadrant(quadrant_y, quadrant_x, is_actual) {

  //Check valid coordinates
  if(quadrant_x<1 || quadrant_x>8 || quadrant_y<1 || quadrant_y>8) return;

  $('#g'+quadrant_y+'-'+quadrant_x).html('<b>'+jstrek.galaxy[quadrant_y-1][quadrant_x-1].enemies.length + '' + jstrek.galaxy[quadrant_y-1][quadrant_x-1].starbases + '' + jstrek.galaxy[quadrant_y-1][quadrant_x-1].stars+'</b>');
    //Check presence of enemies in actual quadrant
    if(jstrek.galaxy[quadrant_y-1][quadrant_x-1].enemies.length>0) {
      $('#g'+quadrant_y+'-'+quadrant_x).removeClass('text-success').addClass('text-danger');
      if(is_actual) {
        if(initial_turn) {
          shields_up();
        }
        set_global_status_alert();
        $('#g'+quadrant_y+'-'+quadrant_x).addClass('bg-warning');
      } else {
        $('#g'+quadrant_y+'-'+quadrant_x).removeClass('bg-warning');
      }
    } else {
      $('#g'+quadrant_y+'-'+quadrant_x).removeClass('text-danger').addClass('text-success');
      if(is_actual) {
        set_global_status_green();
        $('#g'+quadrant_y+'-'+quadrant_x).addClass('bg-warning');
      } else {
        $('#g'+quadrant_y+'-'+quadrant_x).removeClass('bg-warning');
      }
    }
}

function move_in_sector(sector_y, sector_x) {
  //Check coordinates
  if(sector_y>8 || sector_y<1 || sector_x>8 || sector_x<0) { log_communication('Wrong coordinates!','info'); return; }

  if(jstrek.actual_quadrant.sectors[sector_y-1][sector_x-1].content!=null) {
    //Sector busy
    log_communication('Moving in '+sector_y+','+sector_x+': the sector is busy!','info');
    return false;
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
    jstrek.actual_sector.content = 's';
    var ship_image = (jstrek.shields_up) ? 'lexington_su.png' : 'lexington.png';
    $('#sr'+sector_y+'-'+sector_x).html('<img src="images/'+ship_image+'"/>');
    if(initial_turn) {
      log_communication('Welcome aboard, Sir.','info');
    }

  }
  initial_turn = false;

  hide_planet();

  //Update Main Viewer
  var planet_near = search_planet_near();
  if(planet_near != null) {
    show_planet(planet_near.image);
    console.log(planet_near);
  } 

  return true;
}

function command_move(quadrant_y, quadrant_x, sector_y, sector_x) {

  //Check coordinates
  if(quadrant_y>8 || quadrant_y<1 || quadrant_x>8 || quadrant_x<0) { log_communication('Wrong coordinates!','info'); return; }

  if(jstrek.actual_quadrant.y!=quadrant_y || jstrek.actual_quadrant.x!=quadrant_x) {
    //Check warp engine
    if(jstrek.warp_status>0) {  
        //Disable actual quadrant in map
        show_quadrant(jstrek.actual_quadrant.y, jstrek.actual_quadrant.x, false);

        show_warp_starfield();

        window.setTimeout(function() { move_in_quadrant(quadrant_y, quadrant_x, sector_y, sector_x) }, 500+500*lineDistance(jstrek.actual_quadrant, jstrek.galaxy[quadrant_y-1][quadrant_x-1])/jstrek.warp);

        return;
    } else {
        bootbox.alert('Sorry, Sir. Warp Engine are damaged! We can\'t move in another quadrant',function() {focus_on_command();});
    }

  } else {
      
    //Check impulse engine
    if(jstrek.impulse_status>0) {  
        //Already in Quadrant, move in sector
        move_in_sector(sector_y, sector_x);
    } else {
        bootbox.alert('Sorry, Sir. Impulse Engine are damaged! We can\'t move in another sector',function() {focus_on_command();});
    }
  }
  
}

function computer_turn() {
  //Execute the computer turn
  //Only if enemies are in actual quadrant
  if(jstrek.actual_quadrant.enemies.length>0) {
    for(i=0; i<jstrek.actual_quadrant.enemies.length;i++) {
      var enemy = jstrek.actual_quadrant.enemies[i];

      //every enemy ship shoots
      shoot_delay(enemy, 500*i);
      add_stardate(0.1);
    }
  }
  
    focus_on_command();
  command_done = false;
}

function shoot_delay(enemy, delay) {
  $('#sr'+enemy.y+'-'+enemy.x).animate({backgroundColor: "#aa0000"},1000+delay);
  $('#sr'+enemy.y+'-'+enemy.x).animate({backgroundColor: "#303030"},1000+delay);
  window.setTimeout(function() {enemy_shoot(enemy);}, 2000+delay);
}

function torpedo_shoot(sector, after_computer_turn_flag) {

  if(sector.content == null) {
    //Empty sector, missed torpedo
    log_communication('<b>Torpedo '+sector.y+','+sector.x+' missed!</b>','alert');
  }
  //Enemy
  if(sector.content instanceof Enemy) {
    sector.content.shields-=jstrek.torpedo_damage_power;
    if(sector.content.shields < 0) {
      sector.content.health+=sector.content.shields;
      sector.content.shields = 0;
      if(sector.content.health <= 0) {
        //Enemy destroyed
        log_communication('<b>Enemy in '+sector.y+','+sector.x+' destroyed!</b>','success');
        
        $('#sr'+sector.y+'-'+sector.x).html('.');
        console.log(jstrek.actual_quadrant.enemies);
        for(i=0; i< jstrek.actual_quadrant.enemies.length; i++) {
          if(jstrek.actual_quadrant.enemies[i]===sector.content) {
            jstrek.actual_quadrant.enemies.splice(i,1);
            break;
          }
        }
        jstrek.enemies--;
        $('#enemies').text(jstrek.enemies);
        
        sector.content = null;
        show_quadrant(jstrek.actual_quadrant.y, jstrek.actual_quadrant.x, true);
        
        if(jstrek.enemies==0) {
            //End of the game!!
            bootbox.confirm("Good Work! End of the game. Do you want to play again?", function(result) {
                if(result) {
                    init();
                } else {
                    $("#command").prop('disabled', true);
                }
            }); 
        }
        focus_on_command();
      } 
      else {
        log_communication('<b>Sir, we hit Enemy in '+sector.y+','+sector.x+'</b>!','success');
      }     
    } else {
      log_communication('<b>Sir, we hit Enemy\'s shields in '+sector.y+','+sector.x+'</b>!','success');
    }
  }
  //Planet
  if(sector.content instanceof Planet) {
    log_communication('Sir, we damaged the planet '+sector.content.name+'!','warning');
  }

  //decrement torpedos
  $('#torp'+jstrek.torpedos).removeClass('text-danger').addClass('text-muted');
  jstrek.torpedos--;

  if(after_computer_turn_flag) {
    computer_turn();
  }
}

function enemy_shoot(enemy) {
  //Calculate shoot's power
  var randomNumber = getRandomInt(1,10);
  var shoot_power = Math.floor((enemy.health*2 + randomNumber) * enemy.type / 10 + randomNumber);

  if(jstrek.shields_up) {
    //The shoot damages shields
    jstrek.shields-=shoot_power;
    if(jstrek.shields<0) {
      jstrek.shields = 0;
      //Shields don't work anymore
      shields_down();
    }
    shields_meter_gauge.refresh(jstrek.shields);

    log_communication('<b>Attack from ship in '+enemy.y+','+enemy.x+'</b><br/>Shoot Power absorbed by our shields: '+shoot_power,'alert');
  } else {
    //The shoot damages ship's systems

    var remaining_power = shoot_power;
    while(remaining_power>0) {
      var random_system = getRandomInt(0,6);
      var random_damage = getRandomInt(0,remaining_power+1);
      jstrek[system_array[random_system]]-=random_damage;
      remaining_power-=random_damage;
    }
    refresh_systems();
    log_communication('<b>Attack from ship in '+enemy.y+','+enemy.x+'</b><br/>Shoot Power: '+shoot_power,'alert');
  }
  //The shoot hits the ship
  $('body').animate({backgroundColor: "#aa0000"},1000);
  $('body').animate({backgroundColor: "#303030"},1000);
}

function cron_repair() {
        
    if(jstrek.energyconverter_status>0) {
        if(jstrek.energy<100) {
            jstrek.energy++;
        }
    }

    if(jstrek.shields<100) {
        jstrek.shields++;
    }
    refresh_systems();
    
    //Diabolic!
    computer_turn();
}

function check_ship_status() {
    if(jstrek.energy <=0) {
        //Should not go under zero
        jstrek.energy = 0;
        //End of the game, sorry
        bootbox.confirm("Sorry, all systems are without energy. Your crew is died. Would you try again?", function(result) {
            if(result) {
                init();
            } else {
                $("#command").prop('disabled', true);
            }
        }); 
    }
    
    if(jstrek.lifesupport_status<=0) {
        bootbox.confirm("Sorry, life support are without energy. Your crew is died. Would you try again?", function(result) {
            if(result) {
                init();
            } else {
                $("#command").prop('disabled', true);
            }
        }); 
    }
}