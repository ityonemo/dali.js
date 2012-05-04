//////////////////////////////////////////////////////////////////////////////
// laplace.js - a javascript 2D physics engine designed to be used with dali
//

laplace = new function laPlace()
{
  $.extend(this,
  {
    //convenience objects:
    rotationmatrices:[],
    matrixfor: function(angle)
    {
      angle = Math.floor(angle) % 360;
      return laplace.rotationmatrices[angle >= 0 ? angle : angle + 360]
    },

    //i and j hat vectors
    i:{},
    j:{},
    o:{},

    initialize: function()
    {
      //take care of various things that need to happen when after dali has been set up.
      for (var i = 0; i < 360; i++)
        laplace.rotationmatrices.push(dali.rotate(i));
      laplace.i = dali.point(1,0);
      laplace.j = dali.point(0,1);
      laplace.o = dali.point(0,0);
    },
 
    //the physics list.
    objects: [],
    frequency: 100,    //how frequently we do a timestep.
    timestep: 1,       //this is an internal value multiplier.
    _halt: false,

    physics: function()
    {
      for (var i = 0; i < laplace.objects.length; i++)
      {
        var target = laplace.objects[i];
        target.position.add(target.velocity.times(laplace.timestep));
        target.orientation += target.omega * laplace.timestep;
        if (target.timestep) target.timestep();
      }
      if (!laplace._halt)
        setTimeout(laplace.physics,100);
      else
        laplace._halt = false;
    },

    halt: function() {laplace._halt = true;},

    //allows for something to be 'objectified', which creates the relevant member functions.
    objectify:function(whom)
    {
      $.extend(whom,
      {
        position: dali.point(0,0),
        velocity: dali.point(0,0),
        orientation: 0,
        omega: 0,
        mass: 1,
        timestep: undefined,

        //relative kinetic energy
        energyrel: function(object)
        {
          return mass * (this.velocity.minus(object.velocity)).sqr()/2;
        },
      });
      laplace.objects.push(whom);
    }
  });
}

SVGPoint.prototype.plus = function(p)
{
  return dali.point(this.x + p.x, this.y + p.y);
}
SVGPoint.prototype.add = function(p)
{
  this.x += p.x; this.y += p.y;
  return this;
}
SVGPoint.prototype.minus = function(p)
{
  return dali.point(this.x - p.x, this.y - p.y);
}
SVGPoint.prototype.sub = function(p)
{
  this.x -= p.x; this.y -= p.y;
  return this;
}
SVGPoint.prototype.times = function(s)
{
  return dali.point(this.x * s, this.y * s);
}
SVGPoint.prototype.mul = function(s)
{
  this.x *= s; this.y *= s;
  return this;
}
SVGPoint.prototype.divide = function(s)
{
  return dali.point(this.x / s, this.y / s);
}
SVGPoint.prototype.div = function(s)
{
  this.x /= s; this.y /= s;
  return this;
}
SVGPoint.prototype.dot = function(p)
{
  return this.x * p.x + this.y * p.y;
}
SVGPoint.prototype.length = function()
{
  return Math.sqrt(this.x * this.x + this.y * this.y);
}
SVGPoint.prototype.sqr = function()
{
  return this.x * this.x + this.y * this.y;
}
SVGPoint.prototype.hat = function()
{
  return this.divide(this.length());
}
SVGPoint.prototype.proj = function(p)
{
  return p.hat().mul(this.dot(p.hat()));
}
