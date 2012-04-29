////////////////////////////////////////////////////////////////////////
// daligears.js
// example gears using dali.

geartime = 360;

daligear = function(holeradius, innerradius,outerradius,teeth)
{
  gear = picture.group();
  gear.circle(0,0,innerradius);
  var hole = gear.circle(0,0,holeradius);
  $(hole).attr("class","hole");

  var deltatheta = 360 / (teeth * 2);
  var flange = 0.1;

  var innerx1 = innerradius * Math.cos(-flange * Math.PI / teeth);
  var innery1 = innerradius * Math.sin(-flange * Math.PI / teeth);
  var outerx1 = outerradius * Math.cos(flange * Math.PI / teeth);
  var outery1 = outerradius * Math.sin(flange * Math.PI / teeth);
  var outerx2 = outerradius * Math.cos((1 - flange) * Math.PI / teeth);
  var outery2 = outerradius * Math.sin((1 - flange) * Math.PI / teeth);
  var innerx2 = innerradius * Math.cos((1 + flange) * Math.PI / teeth);
  var innery2 = innerradius * Math.sin((1 + flange) * Math.PI / teeth);

  for (var i = 0; i < teeth; i++)
  {
    var a = gear.path("M " + innerx1 + " " + innery1 + " L " + outerx1 + " " + outery1 + " A " + outerradius + " " + outerradius + 
                      " " + deltatheta + " 0 1 " + outerx2 + " " + outery2 + " L " + innerx2 + " " + innery2 + "z");
    a.applytransform(dali.rotate(deltatheta * i * 2));
  }

  $.extend(gear,
  {
    move:function()
    {
      this.rotate = 0;
      $(this).animate({rotate:this.sign * deltatheta * 2}, geartime, "linear", this.move);
    }
  });

  return gear;
}
