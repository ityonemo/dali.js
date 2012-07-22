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

First create an svg environment:

```
surface = dali.SVG(parentdomobject, width, height);
```

You may then begin to create appropriate primitives inside this environment.  Pass primitives a single object
With the expected SVG attributes as a hash.

```
c = surface.circle({cx:0, cy:0, r:50});
p = surface.path({d:pathtext});
g = surface.g();
r = g.rect({x:0, y:0, width:50, height:50});
t = g.text({x:0, y:0});
t.text = "hi mom";
```

### shortcuts

Dali implements useful shortcuts:

attributes can be directly accessed without using jQuery's $().attr
```
c.cx = newx;
c.cy = newy;
c.rx = newr;
```

it's also possible to do some removing.
```
r.remove();  // is the same as...  g.removeChild(r);
surface.removeChild(g);
g.clear(); // removes all children
surface.clear(); //nukes everything
```

### when to use jQuery (not included!)

I suggest using jQuery to make formatting changes.  You can also use stylesheets, in the expected fashion.

```
$(p).css("stroke","#000000");
$(p).css("fill","#RR0000");
```

I suggest using jQuery to do flashy things.
```
$(c).animate({cx:newpos}, time);  //yes this works even though it's not in a 'style' attribute!
$(c).animate({opacity:newval}, time);
$(c).animate({rotate:10}, time);
$(c).mousedown(function(event){alert("hi mom!");};
```

### transformations

you may set an object's _master transform_ as follows (use dali math, as seen below):
```
t.applytransform(dali.matrix("translate", dx, dy));
```

you can alternatively use the following _animateable_ transformations.  Note these are applied AFTER
the master transform.  Base object -> scaling -> rotation -> translation.

```
t.scale = scaling;
t.rotate = rotation;
t.dx = dx;
t.dy = dy;
```

again, jQuery can be used to do flashy things.
```
$(t).animate({rotation})
```

### drag/drop

Code Reference
--------------

### dali general objects and methods

```
dali 
```
(singleton of object _Dali_): main object encapsulating the library namespace.

```
dali.SVG(parent, [width, height,] id, cl)
```
create an `<svg>` tag in the DOM, imbue it with
_width_ and _height_ in the inline style, and it should have id _id_ and class _cl_.


```
dali.create(parent, tag)
```
create a tag in the DOM attached to parent.  Also attaches "svgparent" member to this tag
which corresponds to top level svg tag which contains this tag.  Usually this function
will be automatically called.

### dali math objects
dali math objects require at least one instance of dali.SVG running to properly function.

```
dali.point(x,y)
```
creates an SVGPoint object corresponding to (x,y)

```
dali.rect(left, top, right, bottom)
dali.rect(point1, point2)
```
creates an SVGRect object corresponding to (left, top, right, bottom) or the rect bounded by (point1, point2)

```
dali.rrect(left, top, width, height)
dali.rrect(point1, width, height)
```
creates an SVGRect object corresponding to (left, top, left + width, top + height). compare to `dali.rrect()`

```
dali.matrix()
dali.matrix(mtx)
dali.matrix("translate", x, y)
dali.matrix("scale", s)
dali.matrix("scale", x, y)
dali.matrix("rotate", t, x, y)
dali.matrix("skew", "x", s)
dali.matrix("skew", "y", s)
dali.matrix("skewx", s)
dali.matrix("skewy", s)
dali.matrix("flip", "x")
dali.matrix("flip", "y")
dali.matrix("flipx")
dali.matrix("flipy")
```
creates an SVGMatrix object.  Passing nothing results in the identity; passing a matrix copies the matrix, all other
commands require passing a string descriptor (or two in the case of axis-dependent transform) plus values.

### dali prototype modification methods

dali contains special commands that are used to 'brand' class prototypes with certain attributes.

```
dali.brandTransform(obj, transformation, val)
dali.brandAccessor(obj, name, val, nonnumeric)
dali.brandByArray(obj, array)
```
brandTransform is intended to imbue an SVGElement object with the ability to use animateable transform.
brandAccessor brands an object with svg accessors.
brandByArray takes an array of svg accessor definitions and brands them.

SVGPathElement, SVGCircleElement, SVGEllipseElement, SVGImageElement, SVGRectElement, and SVGTextElement are all branded
with accessors corresponding to their svg properties.

```
dali.makeCreator(obj, tag)
dali.makeCreatorByArray(obj, array)
```
generates a method in obj which creates a child element creating the named tag.  obj is going to be the SVGGElement and
SVGSVGElement.  MakeCreatorByArray allows the mass assignment of methods by passing an array of strings.

```
SVGGElement.prototype.clear()
SVGSVGElement.prototype.clear()
```
clears the group or svg element of all of its children.

```
SVGTextElement.prototype.text
```
mapped to SVGTextElement.prototype.textContent

```
SVGElement.prototype.remove()
```
shortcut for `this.parent.remove(this)`

```
SVGElement.prototype.applytransform(transformation, clobber)
```
Applys a transformation to the non-animateable transformation stack.

```
SVGElement.prototype.realBBox()
SVGElement.prototype.left
SVGElement.prototype.top
SVGElement.prototype.right
SVGElement.prototype.bottom
SVGElement.prototype.width
SVGElement.prototype.height
```
Calculates the real bounding box of the object relative to the parent SVG object.  Also overrides the prototypes
for left, top, right, bottom, width, and height values.

```
SVGElement.prototype.setdrag(ondragend, ondragmove, ondragstart)
```
Assigns the ondragend, ondragmove, and ondragstart methods for any given svg element.

