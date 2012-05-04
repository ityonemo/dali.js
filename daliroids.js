daliroids = {}; //the playing field
transfield = {}; //correctly transformed field
p = {}; // the ship.
var width, height;

document.onready = function ()
{
  width = document.body.getBoundingClientRect().width;
  height = document.body.getBoundingClientRect().height;

  daliroids = dali.SVG(document.body, width, height, "daliroids");
  laplace.initialize();

  laplace.posttimestep.push(function()
  { 
    daliroids.setAttribute("viewBox", " " + (p.position.x - width/2) + " " + (p.position.y + -height/2) + " " + width + " " + height);
  });

  spacedebris.initialize();

  p = daliroids.path("M 20 0 L -10 10 L -5 0 L -10 -10 z");
  $(p).attr("id","ship");
  laplace.objectify(p);
  p.timestep = function(){
    p.applytransform(dali.translate(p.position.x,p.position.y).multiply(laplace.matrixfor(p.orientation)), true);
  }

  window.addEventListener("keydown", blah);
  laplace.physics();
}

spacedebris = {

  debris: [],

  initialize: function()
  {
    debrisfield = daliroids.group("debris");
    for (var i = 0; i < 20; i++)
    {
      var chunk = debrisfield.rect(-2,-1.5,4,3);
      laplace.objectify(chunk);
      spacedebris.create(chunk);
    }
  },

  create: function(chunk)
  {
    chunk.position.x = Math.random() * width - width/2;
    chunk.position.y = Math.random() * height - height/2;
    chunk.velocity.x = Math.random() * 4 - 2;
    chunk.velocity.y = Math.random() * 4 - 2;
    chunk.orientation = Math.floor(Math.random() * 360);
    chunk.omega = Math.random() * 30 - 15;
    $(chunk).attr("class","chunk");

    chunk.timestep = function()
    {
      chunk.applytransform(dali.translate(chunk.position.x,chunk.position.y).multiply(laplace.matrixfor(chunk.orientation)), true);
    };

    spacedebris.debris.push(chunk);
  }
}

/////////////////////////////
//KEY STUFF

KEYDN = 40;
KEYUP = 38;
KEYLT = 37;
KEYRT = 39;

blah = function(event)
{
  switch(event.keyCode)
  {
    case KEYLT:
      p.omega -= 1;
    break;
    case KEYRT:
      p.omega += 1;
    break;
    case KEYDN:
      p.velocity.x += Math.cos(p.orientation * Math.PI / 180);
      p.velocity.y += Math.sin(p.orientation * Math.PI / 180);
    break;
  }
}
