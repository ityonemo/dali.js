////////////////////////////////////////////////////////////////////////
// dali.js
// - a framework for cleanly manipulating SVG using Javascript.
// jQuery is required for this to work.  The developer is responsible for
// supplying either jQuery.js or an equivalent framework to support the
// jQuery functions used by svg.js.

var dali = new function Dali()
{
  this.settings =  //dali settings
  {
    dragradius:2,
  }

  this.dragging = false; //stores the "dragging" state.
  this.instances = undefined; //keeps instances of the SVG DOM object; key for doing math-ey stuff.

  this.SVG = function(parent, width, height, id, cl)
  {
    //input error checking:
    width = parseInt(width);
    height = parseInt(height);
    if (isNaN(width) || isNaN(height))
      throw new Error("width and height must be integer values");

    //create the object in the DOM.
    var svgobject = document.createElementNS("http://www.w3.org/2000/svg","svg");
    //set the important svg properties.
    svgobject.setAttribute("version", "1.1");
    svgobject.setAttribute("style","overflow-x: hidden; overflow-y: hidden; position:relative");

    //modify basic attributes of the svg element.
    delete svgobject.width;
    delete svgobject.height;
    //setters and getter for height and width; use the passed variables as private variables.
    svgobject.__defineGetter__("width", function(){return width});
    svgobject.__defineSetter__("width", function(val){svgobject.setAttribute("width", val); return width = val;});
    svgobject.__defineGetter__("height", function(){return height});
    svgobject.__defineSetter__("height", function(val){svgobject.setAttribute("height", val); return height = val;});

    //set the width and height
    svgobject.width = width;
    svgobject.height = height;

    //brand the object with the id and class.
    if (id) svgobject.setAttribute("id",id);
    if (cl) svgobject.setAttribute("class", cl)

    //add the svg object to the parent
    parent.appendChild(svgobject);

    //record the parent object
    this.svgparent = parent;

    //store the svg object in dali.instances
    dali.instance = svgobject;

    //return value
    return svgobject;
  };

  //////////////////////////////////////////////////////////////////////////
  // SVG object creation
  this.create = function(tag, parent)
  {
    var newobject = document.createElementNS("http://www.w3.org/2000/svg", tag);
    newobject.svgparent = parent.svgparent; //pass the parent of the svg object down the line.

    //clear out predefined results for attributes.
    if (newobject.brands)
      for (var i = 0; i < newobject.brands.length; i++)
        delete newobject[newobject.brands[i][0]];

    //add this to the parent.
    parent.appendChild(newobject);
    return newobject;
  };

  //////////////////////////////////////////////////////////////////////////
  // DALI MATH OBJECTS
 
  //create special "point", "rect", and "matrix" functions for dali which make constructing points and rects much easier.
  this.point = function(x, y)
  {
    if (!dali.instance)
      throw new Error("can't make dali objects without an SVG element.");

    var point = dali.instance.createSVGPoint();
    point.x = x; point.y = y;
    return point;
  };

  this.rect = function(left, top, right, bottom)
  {
    if (!dali.instance)
      throw new Error("can't make dali objects without an SVG element.");

    var rect = dali.instance.createSVGRect();
    rect.left = left; rect.top = top;
    rect.right = right; rect.bottom = bottom;
    return rect;
  };

  this.rrect = function(left, top, width, height) //relative rect
  {
    if (!dali.instance)
      throw new Error("can't make dali objects without an SVG element.");

    var rect = dali.instance.createSVGRect();
    rect.left = left; rect.top = top;
    rect.width = width; rect.height = height;
    return rect;
  };

  this.matrix = function() //matrix
  {
    if (!dali.instance)
      throw new Error("can't make dali objects without an SVG element.");

    var matrix = dali.instance.createSVGMatrix();

    if (!arguments[0]) return matrix;

    if (arguments[0] instanceof SVGMatrix)
      return matrix.multiply(arguments[0]);

    switch (arguments[0].toLowerCase())
    {
      case "translate":
        matrix = matrix.translate(
          isNaN(arguments[1]) ? 0: arguments[1],
          isNaN(arguments[2]) ? 0: arguments[2])
      break;
      case "scale":
        if (isNaN(arguments[1]))
          throw new Error("must scale by at least one numerical value.");

        if (isNaN(arguments[2]))
          matrix = matrix.translate(arguments[1], arguments[1]);
        else
          matrix = matrix.translate(argments[1], arguments[2]);
      break;
      case "rotate":
        if (isNaN(arguments[1]))
          throw new Error("must rotate by at least one numerical value.");

        matrix = matrix.rotate(arguments[1],
          isNaN(arguments[2]) ? 0: arguments[2],
          isNaN(arguments[3]) ? 0: arguments[3]);
      break;
      case "skew":
        if (isNaN(arguments[2])) throw new Error("must skew by a numerical value.");
        matrix = matrix["skew" + arguments[1].toUpperCase()](arguments[2])
      break;
      case "skewx":
        if (isNaN(arguments[1])) throw new Error("must skew by a numerical value."); 
        matrix = matrix.skewX(arguments[1]);
      break;
      case "skewy":
        if (isNaN(arguments[1])) throw new Error("must skew by a numerical value."); 
        matrix = matrix.skewY(arguments[1]);
      break;
      case "flip":
        matrix = matrix["flip" + arguments[1].toUpperCase()]();
      break;
      case "flipx":
        matrix = matrix.flipX();
      break;
      case "flipy":
        matrix = matrix.flipY();
      break;
    }
    return matrix;
  };
};

//graphics extensions.
dali.brandTransform = function(obj, transformation, val)
//adds transformation members to an SVGobject's prototype.
{
  var proto = obj.prototype;
  if (isNaN(val)) throw new Error("transformations must be numeric values.");
  proto["_" + transformation] = val;
  proto.__defineGetter__(transformation, function(){return this["_" + transformation];});
  proto.__defineSetter__(transformation, 
    function(x)
    {
      if (isNaN(x)) throw new Error("transformations must be numeric values.");
      this["_" + transformation] = x; this.applytransform();
    });
};

dali.brandAccessor = function(obj, name, val, nonnumeric)
//modifies an SVGobject's prototype to allow for direct accessor modification.
{
  var proto = obj.prototype;
  if (isNaN(val) && (!nonnumeric)) throw new Error("property " + name + " must be numeric.");
  proto["_" + name] = val;
  proto.__defineGetter__(name, function(){return this["_" + name];});
  proto.__defineSetter__(name,
    function(x)
    {
      if (isNaN(x) && (!nonnumeric)) throw new Error("property " + name + " must be numeric.");
      this.setAttribute(name, x); 
      return this["_" + name] = x;
    });
}

dali.brandByArray = function(obj, arr)
//make branding zippety fast
{
  for (var i = 0; i < arr.length; i++)
    dali.brandAccessor(obj, arr[i][0], arr[i][1], arr[i][2]);
  obj.prototype.brands = arr;
}

///////////////////////////////////////////////////////////////////////////////
// Extensive modification of the SVG DOM object collection

dali.brandTransform(SVGElement,"dx", 0);
dali.brandTransform(SVGElement,"dy", 0);
dali.brandTransform(SVGElement,"rotate", 0);
dali.brandTransform(SVGElement,"scale", 1);
dali.brandByArray(SVGPathElement,[["d","M 0 0", true]])
dali.brandByArray(SVGCircleElement, [["cx", 0],["cy", 0],["r", 0]]);
dali.brandByArray(SVGEllipseElement, [["cx", 0],["cy", 0],["rx", 0],["ry", 0]]);
dali.brandByArray(SVGImageElement, [["x", 0],["y", 0],["width", 0],["height",0],["src", "", true]]);
dali.brandByArray(SVGRectElement, [["x", 0],["y", 0],["width", 0],["height",0],["r",0]]);
dali.brandByArray(SVGTextElement, [["x", 0],["y", 0]]);

dali.makeCreator = function(obj, tag)
{
  obj.prototype[tag] = function(o)
  {
    var tgt = dali.create(tag, this);
    if (o) tgt.transfer(o);
    return tgt;
  }
}

dali.makeCreatorsByArray = function(obj, arr)
{
  for (var i = 0; i < arr.length; i++)
    dali.makeCreator(obj, arr[i]);
}

tagarray = ["g","path", "circle", "ellipse", "image", "rect", "text"];

dali.makeCreatorsByArray(SVGGElement, tagarray);
dali.makeCreatorsByArray(SVGSVGElement, tagarray);

//create "clear" functionality for both the primary SVG element as well as the group element.
SVGSVGElement.prototype.clear =
SVGGElement.prototype.clear = function()
{
  for (var j = this.childNodes.length - 1; j >= 0; j--)
    this.removeChild(this.childNodes[j]);
};

////////////////////////////////////////////////////////////////////////////////////////////////
// SVG textelement hack
SVGTextElement.prototype.__defineGetter__("text", function(){return this.textContent;});
SVGTextElement.prototype.__defineSetter__("text", function(v){return this.textContent = v;});

////////////////////////////////////////////////////////////////////////////////////////////////
// GENERAL EXTENSIONS TO ALL SVGElements:

SVGElement.prototype.transfer = function(from)
{
  for (prop in from)
    this[prop] = from[prop];
};

SVGElement.prototype.remove = function()
{
  this.parentNode.removeChild(this);
}

SVGElement.prototype.applytransform = function(transformation, clobber)
{
  if (!this.currenttransform || clobber)
    this.currenttransform = dali.matrix();
  this.currenttransform = this.currenttransform.multiply(transformation);

  var scale = (this._scale != 1) ? "scale(" + this._scale + ")" : "";
  var rotate = (this._rotate) ? "rotate(" + this._rotate + ")" : "";
  var translate = (this._dx || this._dy) ? ("translate(" + (this._dx?this._dx:"0") + "," + (this._dy?this._dy:"0") + ")" ) : "";

  this.setAttribute("transform", (this.currenttransform ? this.currenttransform.toString() : "") + translate + rotate + scale);
},

SVGElement.prototype.realBBox = function()
//this is a hack to find the real bounding box after all transformations have been completed.
{
  var thisbox = this.getBoundingClientRect();
  var parbox = this.svgparent.getBoundingClientRect();
  return dali.rrect(thisbox.left - parbox.left + this.svgparent.scrollLeft, thisbox.top - parbox.top + this.svgparent.scrollTop, thisbox.width, thisbox.height);
}

SVGElement.prototype.__defineGetter__("left", function(){return this.realBBox().left;});
SVGElement.prototype.__defineGetter__("right", function(){return this.realBBox().right;});
SVGElement.prototype.__defineGetter__("top", function(){return this.realBBox().top;});
SVGElement.prototype.__defineGetter__("bottom", function(){return this.realBBox().bottom;});
SVGElement.prototype.__defineGetter__("width", function(){return this.realBBox().width;});
SVGElement.prototype.__defineGetter__("height", function(){return this.realBBox().height;});

////////////////////////////////////////////////////////////////////////////
// DRAG/DROP FUNCTIONALITY

SVGElement.prototype.setdrag = function(ondragend, ondragmove, ondragstart)
{
  this.ondragend = ondragend;
  this.ondragmove = ondragmove;
  this.ondragstart = ondragstart;

  this.addEventListener("mousedown", this.registerdrag);
}

SVGElement.prototype.registerdrag = function(event)
{
  dali.dragobject = this;
  dali.dragoriginX = event.clientX;
  dali.dragoriginY = event.clientY;
  window.addEventListener("mousemove", dali.dragobject.dragmove);
  window.addEventLIstener("mouseup", dali.dragobject.dragup);
}

SVGElement.prototype.dragmove = function(event)
{
  event.dx = event.clientX - dali.dragoriginX;
  event.dy = event.clientY - dali.dragoriginY;

  if (!dali.dragging)
  {
    if (Math.abs(event.dx) + Math.abs(event.dy) > dali.settings.dragradius)
    {
      dali.dragging = true;
      if (dali.dragobject.ondragstart)
        dali.dragobject.ondragstart(event);
    }
  } else
  {
    var sp = dali.dragobject.svgparent;
    var box = sp.getBoundingClientRect();
    if (dali.dragobject.ondragmove)
      dali.dragobject.ondragmove(event.clientX - box.left + sp.scrollLeft, event.clientY - box.top + sp.scrollTop, event);
  }
}

SVGElement.prototype.dragup = function(event)
{
  if (dali.dragging)
  { //unregister event listeners
    if (dali.dragobject.ondragend)
      dali.dragobject.ondragend(event);
    dali.dragging = false;
    window.removeEventListener("mousemove", dali.dragobject.dragmove);
    window.removeEventListener("mouseup", dali.dragobject.dragup);
    dali.dragobject = undefined;
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SVG MATH modifications

SVGRect.prototype.__defineSetter__("left",function(val){this.x = val});
SVGRect.prototype.__defineGetter__("left",function(){return this.x});
SVGRect.prototype.__defineSetter__("top",function(val){this.y = val});
SVGRect.prototype.__defineGetter__("top",function(){return this.y});
SVGRect.prototype.__defineSetter__("right",function(val){if(val > this.x) this.width = val - this.x});
SVGRect.prototype.__defineGetter__("right",function(){return this.x + this.width});
SVGRect.prototype.__defineSetter__("bottom",function(val){if (val > this.y) this.height = val - this.y});
SVGRect.prototype.__defineGetter__("bottom",function(){return this.y + this.height});
SVGRect.prototype.__defineGetter__("topleft",function(){return dali.point(this.left, this.top)});
SVGRect.prototype.__defineGetter__("topright",function(){return dali.point(this.right, this.top)});
SVGRect.prototype.__defineGetter__("bottomleft",function(){return dali.point(this.left, this.bottom)});
SVGRect.prototype.__defineGetter__("bottomright",function(){return dali.point(this.right, this.bottom)});

SVGRect.prototype.contains = function(x, y)
{ 
  if (x instanceof SVGRect) // check to see if we have passed an SVGRect.
  {
    return ((x.left >= this.left) && (x.right <= this.right) && (x.top >= this.top) && (x.bottom <= this.bottom)) //assume it's anotherbbox.
  } else if (x instanceof SVGPoint)
  {
    return ((x.x >= this.left) && (x.x <= this.right) && (x.y >= this.top) && (x.y <= this.bottom))
  } else if (!(isNaN(y) || isNaN(x)))
  {
    return ((x >= this.left) && (x <= this.right) && (y >= this.top) && (y <= this.bottom));                       //assume it's a point.
  }
}

SVGRect.prototype.overlaps = function(box)
{
  return !((box.left > this.right) || 
           (box.right < this.left) || 
           (box.top > this.bottom) || 
           (box.bottom < this.top));
}

SVGMatrix.prototype.toString = function()
{
  return "matrix(" + this.a + " " + this.b + " " + this.c + " " + this.d + " " + this.e + " " + this.f + ")";
}
