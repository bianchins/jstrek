function Quadrant(y,x,enemies, planets, stars, starbases) {
  this.y = y;
  this.x = x;
  this.enemies = enemies;
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
    this.planets[i] = new Planet('AX-'+i, contain_energy, contain_people);
  }
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
  this.name = name;
  this.type = type;
}

function Planet(name, contain_energy, contain_people) {
  this.name = name;
  this.contain_energy = contain_energy;
  this.contain_people = contain_people;
}