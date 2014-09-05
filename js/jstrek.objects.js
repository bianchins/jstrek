function Quadrant(y,x,enemies, planets, stars, starbases) {
  this.y = y;
  this.x = x;
  this.enemies = new Array(enemies);
  this.planets = new Array(planets);
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
  //Populate the quadrant with planets
  for(i=0; i< planets; i++) {
    var contain_energy = Math.random() < 0.5;
    var contain_people = Math.random() < 0.5;
    this.planets[i] = new Planet(chance.word({syllables: 3}), contain_energy, contain_people);
  }
  //Populate the quadrant with enemies
  for(i=0; i< enemies; i++) {
    var health = getRandomInt(50,100);
    var shields = getRandomInt(0,100);
    var type = 2;
    if(shields < 50) type = 1;
    if(shields > 80) type = 2;
    this.enemies[i] = new Enemy(health, shields, type, 0, 0);
  }
}

function Enemy(health, shields, type, y, x) {
  this.health = health;
  this.shields = shields;
  this.type = type;
  this.y = y;
  this.x = x;
}

function Sector(y,x,content) {
  this.y = y;
  this.x = x;
  this.content = content;
}

// Starbase
// type 1 = Starbase
// type 2 = Research Base
// type 3 = Supply Depot
function Starbase(name, type) {
  this.name = name.capitalize();
  this.type = type;
}

function Planet(name, contain_energy, contain_people) {
  this.name = name.capitalize();
  this.contain_energy = contain_energy;
  this.contain_people = contain_people;
}