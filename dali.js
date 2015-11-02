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
    //create the object in the DOM.
    var svgobject = document.createElementNS("http://www.w3.org/2000/svg","svg");
    //set the important svg properties.
    svgobject.setAttribute("version", "1.1");
    svgobject.setAttribute("style","overflow-x: hidden; overflow-y: hidden; position:relative");

    //input error checking:
    width = parseInt(width);
    height = parseInt(height);
    if (isNaN(width))
    {
      //check the condition that we aren't passing a width and height.
      id = width;
      cl = height;
      width = undefined;
      height = undefined;
    }

    //brand the object with the id and class.
    if (id) svgobject.setAttribute("id",id);
    if (cl) svgobject.setAttribute("class", cl)

    if (!width)
      width = svgobject.getBoundingClientRect().width;
    if (!height)
      height = svgobject.getBoundingClientRect().height;

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

    //add the svg object to the parent
    parent.appendChild(svgobject);

    //record the parent object
    svgobject.svgparent = svgobject;

    //store the svg object in dali.instance
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
    //check to see if we are passing two SVGPoints
    if ((left instanceof SVGPoint) && (top instanceof SVGPoint))
    {
      rect.left = Math.min(left.x, right.x);
      rect.top = Math.min(left.y, right.y);
      rect.right = Math.max(left.x, right.x);
      rect.bottom = Math.max(left.y, right.y);
    }
    else
    {
      if (isNaN(left) || isNaN(top) || isNaN(right) || isNaN(bottom))
        throw new Error("SVG rects must be created with four numbers");

      rect.left = parseFloat(left); rect.top = parseFloat(top);
      rect.right = parseFloat(right); rect.bottom = parseFloat(bottom);

      //check to see that our left, right, top, and bottom are okay.
      if ((rect.left > rect.right) || (rect.top > rect.bottom))
        throw new Error("SVG rects must be created with correct relative positions.");
    }
    return rect;
  };

  this.rrect = function(left, top, width, height) //relative rect
  {
    if (!dali.instance)
      throw new Error("can't make dali objects without an SVG element.");

    var rect = dali.instance.createSVGRect();
    
    if ((left instanceof SVGPoint) && !(isNaN(top) || isNaN(width)))
    {
      rect.left = left.x;
      rect.top = left.y;
      rect.width = parseFloat(top);
      rect.height = parseFloat(width);
    }
    else
    {
      if (isNaN(left) || isNaN(top) || isNaN(width) || isNaN(height))
        throw new Error("SVG rects must be created with four numbers");

      rect.left = parseFloat(left); rect.top = parseFloat(top);
      rect.width = parseFloat(width); rect.height = parseFloat(height);

      //check to see if our inputs have been valid.
      if ((rect.width < 0) || (rect.height < 0))
        throw new Error("SVG rects must be created with nonnegative widths and heights")
    }
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
        if (isNaN(arguments[1]))
        {
          if (arguments[1] instanceof SVGPoint)
            matrix = matrix.translate(arguments[1].x, arguments[1].y);
          else
            throw new Error("single argument must be an SVG Point.")
        }
        else
        {
          if (isNaN(arguments[2]))
            throw new Error("two arguments must both be numbers.")
          else 
            matrix = matrix.translate(parseFloat(arguments[1]), parseFloat(arguments[2]));
        }
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
      this["_" + transformation] = x; //set the internal variable.
      this.settransforms();           //push the changes to the DOM.
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

dali.makeCreator = function(obj, tag, alias)
{
  obj.prototype[alias ? alias : tag] = function(o)
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

// SVG SVG & G element "group" alias hacks
dali.makeCreator(SVGSVGElement, "g", "group");
dali.makeCreator(SVGGElement, "g", "group");

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
// GENERAL Adding extensions to various SVG elements:

dali.brandfunctions = function(obj)
{
  obj.prototype.transfer = function(from)
  {
    for (prop in from)
      switch(prop)
      {
        case "center":
          //check to make sure our destination is compatible and our inputs are ok.
          if (this.cx && (!isNaN(from.center.x)) && (!isNaN(from.center.y)))
          {
            this.cx = parseFloat(from.center.x);
            this.cy = parseFloat(from.center.y);
          }
        break;
        case "point":
          //check to make sure our destination is compatible and our inputs are ok.
          if (this.x && (!isNaN(from.point.x)) && (!isNaN(from.point.y)))
          {
            this.x = parseFloat(from.point.x);
            this.y = parseFloat(from.point.y);
          }
        break;
        case "points":
          //you can also assign rects with a rect object.
          if (this.width && (!isNaN(from[0].x)) && (!isNaN(from[0].y)) && (!isNaN(from[1].x)) && (!isNaN(from[1].y)))
          {
            this.x = Math.min(parseFloat(from[0].x),parseFloat(from[1].x));
            this.y = Math.min(parseFloat(from[0].y),parseFloat(from[1].y));
            this.width = Math.abs(parseFloat(from[0].x) - parseFloat(from[1].x));
            this.height = Math.abs(parseFloat(from[0].y) - parseFloat(from[1].y));
          }
        break;
        case "radius": //alias for "r"
          if (this.r && (!isNaN(from.radius)))
            this.r = parseFloat(from.radius);
        break;
        case "rect":
          if (this.width && (from.rect instanceof SVGRect))  //check to see if our object is compatible.
          {
            this.x = from.rect.left;
            this.y = from.rect.top;
            this.width = from.rect.width;
            this.height = from.rect.height;
          }
        break;
        case "id":
        case "class":
          this.setAttribute(prop, from[prop]);
        break;
        default:
          if (this[prop])
            this[prop] = from[prop];
      }
  };

  obj.prototype.remove = function()
  {
    this.parentNode.removeChild(this);
  };

  obj.prototype.applytransform = function(transformation, clobber)
  {
    if (!this.currenttransform || clobber)
      this.currenttransform = dali.matrix();
    this.currenttransform = this.currenttransform.multiply(transformation);
    this.settransforms();
  },

  obj.prototype.settransforms = function()
  {
    var scale = (this._scale != 1) ? "scale(" + this._scale + ")" : "";
    var rotate = (this._rotate) ? "rotate(" + this._rotate + ")" : "";
    var translate = (this._dx || this._dy) ? ("translate(" + (this._dx?this._dx:"0") + "," + (this._dy?this._dy:"0") + ")" ) : "";

    this.setAttribute("transform", translate + rotate + scale + (this.currenttransform ? this.currenttransform.toString() : ""));
  }

  obj.prototype.realBBox = function()
  //this is a hack to find the real bounding box after all transformations have been completed.
  {
    var thisbox = this.getBoundingClientRect();
    var parbox = this.svgparent.getBoundingClientRect();
    return dali.rrect(thisbox.left - parbox.left + this.svgparent.scrollLeft, thisbox.top - parbox.top + this.svgparent.scrollTop, thisbox.width, thisbox.height);
  }

  obj.prototype.__defineGetter__("left", function(){return this.realBBox().left;});
  obj.prototype.__defineGetter__("right", function(){return this.realBBox().right;});
  obj.prototype.__defineGetter__("top", function(){return this.realBBox().top;});
  obj.prototype.__defineGetter__("bottom", function(){return this.realBBox().bottom;});
  obj.prototype.__defineGetter__("width", function(){return this.getBoundingClientRect().width;});
  obj.prototype.__defineGetter__("height", function(){return this.getBoundingClientRect().height;});

  ////////////////////////////////////////////////////////////////////////////
  // DRAG/DROP FUNCTIONALITY

  obj.prototype.setdrag = function(ondragend, ondragmove, ondragstart)
  {
    this.ondragend = ondragend;
    this.ondragmove = ondragmove;
    this.ondragstart = ondragstart;

    this.addEventListener("mousedown", this.registerdrag);
  };

  obj.prototype.registerdrag = function(event)
  {
    dali.dragobject = this;
    dali.dragoriginX = event.clientX;
    dali.dragoriginY = event.clientY;
    window.addEventListener("mousemove", dali.dragobject.dragmove);
    window.addEventLIstener("mouseup", dali.dragobject.dragup);
  };

  obj.prototype.dragmove = function(event)
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
  };

  obj.prototype.dragup = function(event)
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
  };
};

//brand the SVG elements.
[SVGGElement, 
 SVGPathElement,
 SVGCircleElement,
 SVGEllipseElement,
 SVGImageElement,
 SVGRectElement,
 SVGTextElement].map(dali.brandfunctions);

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
