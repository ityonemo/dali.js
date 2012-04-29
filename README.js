//dali.js
//A SIMPLE SVG framework.
//instead of abstracting the SVG DOM, just add attributes/accessors to the DOM objects.
//REQUIRES jQUERY.
//How to use:

surface = new dali.SVG(parentdomobject, width, height);

//just use obviously-named methods to create new primitives.
surface.circle(cx, cy, r);
surface.ellipse(cx, cy, rx, ry);
p = surface.path(pathtext);
surface.rect(x, y, width, height, r);
t = surface.text(x, y, text);

//format primitives by using jQuery css.
$(p).css("stroke","#000000");
$(p).css("fill","#RR0000");

//create groups simply.
g = surface.group();
g.circle(cx, cy, r);
e = g.ellipse(cx, cy, rx, ry);
//etc

//you can access and modify attributes without using jQuery's $().attr
e.cx = newx;
e.cy = newy;
e.r = newr;

//NB: you cannot access css attributes in this fashion.

//use jQuery to do flashy things.
$(e).animate({cx:newpos}, time);
$(e).animate({opacity:newval}, time);
$(e).mousedown(function(event){alert("hi mom!");};

//delete objects by using standard dom stuff.
g.removeChild(e);
surface.removeChild(g);

//transformations.  Use dali.XXXX where XXXX is the transformation.

e.transform(new dali.Translate(dx,dy));

//TODO
// complex path management
