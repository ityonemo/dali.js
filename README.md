dali.js
=======

A SIMPLE SVG framework.
-----------------------

the dali philosophy: don't abstract the SVG DOM.  SVG is here to stay, let's use the power
of Javascript to make SVG work.

dali.js is validated in google chrome, and occasionally in firefox.

dali.js is not jsMinn'ed.  I don't have a problem with jsMin, but if you want to do it, do it yourself.

Using dali.js
-------------

surface = dali.SVG(parentdomobject, width, height);

//just use obviously-named methods to create new SVG primitives.
surface.circle({cx:0, cy:0, r:50});
p = surface.path(pathtext);
surface.rect({x:0, y:0, width:50, height:50});
t = surface.text({x:0, y:0});
t.text = "hi mom"

//format primitives by using jQuery css.  You can also use stylesheets, which is the smarter (TM) thing to do.
$(p).css("stroke","#000000");
$(p).css("fill","#RR0000");

//you can access and modify attributes without using jQuery's $().attr
e.cx = newx;
e.cy = newy;
e.rx = newr;

//NB: you cannot access css attributes in this fashion.

//use jQuery to do flashy things.
$(e).animate({cx:newpos}, time);
$(e).animate({opacity:newval}, time);
$(e).animate({rotate:10}, time);
$(e).mousedown(function(event){alert("hi mom!");};

//delete objects by using standard dom stuff. or shortucts
e.remove();  // is the same as...  g.removeChild(e);
surface.removeChild(g);
<<<<<<< HEAD
//or, use the remove shortcut:
e.remove(); // === e.parentNode.remove(e);

=======
//or, shortcut!
>>>>>>> newdali

//transformations.  Use dali.XXXX where XXXX is the transformation.

e.applytransform(dali.matrix("translate", dx, dy));

//you can alternatively use the following transformations directly:
//applied transformations are cumulative, direct transformations
//will bash previous direct transforms

e.scale = scaling;
e.rotate = rotation;
e.dx = dx;
e.dy = dy;

//transformations are performed in the order of: scale, rotate, translate, applied


Reference
---------

dali (singleton of object _Dali_): main object encapsulating the library namespace.

dali.SVG(parent, width, height, id, cl): create an <svg> tag in the DOM, imbue it with
_width_ and _height_ in the inline style, and it should have id _id_ and class _cl_.
