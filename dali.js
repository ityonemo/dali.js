////////////////////////////////////////////////////////////////////////
// dali.js
// - a framework for cleanly manipulating SVG using Javascript and jQuery.
// jQuery is required for this to work.  The developer is responsible for
// supplying either jQuery.js or an equivalent framework to support the
// jQuery functions used by svg.js.

var dali = 
{
  //creates and returns an SVG DOM object.
  SVG: function(parent, _width, _height, id)
  {
    //create the object in the DOM.
    var svgobject = document.createElementNS("http://www.w3.org/2000/svg","svg");
    //set the important svg properties.
    $(svgobject).attr("version", "1.1");
    $(svgobject).css("overflow-x","hidden").css("overflow-y","hidden").css("position","relative");

    //create a set of attribute accessors to dynamically change width and height.
    delete svgobject.width;
    delete svgobject.height;
    svgobject.__defineGetter__("width",function(){return svgobject._width;});
    svgobject.__defineSetter__("width",function(val){$(svgobject).attr("width",val); return svgobject._width = val;});
    svgobject.__defineGetter__("height",function(){return svgobject._height;});
    svgobject.__defineSetter__("height",function(val){$(svgobject).attr("height",val); return svgobject._height = val;});
  
    //set the width and height, if applicable.
    if (!(isNaN(_width) || isNaN(_height)))
    {
      svgobject.width = _width;
      svgobject.height = _height;
    }
    else
    { 
      svgobject.width = 0; svgobject.height = 0;
      if (_width)
        $(svgobject).attr("id",_width); //let's guess that the _width variable contains the name.
    }

    //set the name, if applicable.
    if (id)
    {
      $(svgobject).attr("id", id);
    }

    //use jQuery to cleanly extend the SVG dom object.
    $.extend(svgobject, dali.creatorextensions)

    //attach it to the parent.
    parent.appendChild(svgobject)
    svgobject.svgparent = parent;
 
    //create special "point", "rect", and "matrix" functions for dali which make constructing points and rects much easier.
    dali.point = function(x, y)
    {
      var point = svgobject.createSVGPoint();
      point.x = x; point.y = y;
      return point;
    };

    dali.rect = function(left, top, right, bottom)
    {
      var rect = svgobject.createSVGRect();
      rect.left = left; rect.top = top;
      rect.right = right; rect.bottom = bottom;
      return rect;
    };

    dali.rrect = function(left, top, width, height) //relative rect
    {
      var rect = svgobject.createSVGRect();
      rect.left = left; rect.top = top;
      rect.width = width; rect.height = height;
      return rect;
    };

    dali.matrix = function()
    { //creates a ((1,0,0)(0,1,0)) identity matrix
      return svgobject.createSVGMatrix();
    }

    return svgobject;
  },

  //dali creator object domains.
  creatorextensions:
  {
    //dali graphical objects:
    path: function(pathtext)
    {
      var pathobject = dali.create("path", this);
      pathobject.__setaccessors__("d", pathtext);

      return pathobject;
    },
    
    circle: function(x, y, rx, ry)  //bifunctional circle/ellipse function.
    {
      var circleobject = dali.create((ry == undefined) ? "circle" : "ellipse", this);
      circleobject.__setaccessors__("cx", x);
      circleobject.__setaccessors__("cy", y);

      if (ry == undefined) // then we've made a circle.
        circleobject.__setaccessors__("r", rx);
      else //otherwise it's an ellipse.
      {
        circleobject.__setaccessors__("rx", rx);
        circleobject.__setaccessors__("ry", ry);
      }

      return circleobject;
    },

    ellipse: this.circle,

    image: function(src, x, y, width, height)
    {
      var imageobject = dali.create("image", this);
      imageobject.__setaccessors__("src", src);
      imageobject.__setaccessors__("x", x);
      imageobject.__setaccessors__("y", y);
      imageobject.__setaccessors__("width", width);
      imageobject.__setaccessors__("height", height);

      return imageobject;
    },

    rect: function(x, y, width, height, r)
    {
      var rectobject = dali.create("rect", this);
      rectobject.__setaccessors__("x", x);
      rectobject.__setaccessors__("y", y);
      rectobject.__setaccessors__("width", width);
      rectobject.__setaccessors__("height", height);
      rectobject.__setaccessors__("r", (r ? r : 0));

      return rectobject;
    },

    text: function(x, y, text)
    {
      var textobject = dali.create("text", this);
      textobject.__setaccessors__("x", x);
      textobject.__setaccessors__("y", y);
      textobject.textContent = text;

      return textobject;
    },

    group: function(id)
    {
      var groupobject = dali.create("g", this);
      $.extend(groupobject, dali.creatorextensions);
      if (id)
        $(groupobject).attr("id", id);

      return groupobject;
    },

    clear: function()
    //nukes all the stuff in this DOM object.
    {
      for (var j = this.childNodes.length - 1; j >= 0; j--)
        this.removeChild(this.childNodes[j]);
    },
  },

  //create svg object function
  create: function (tag, dom)
  {
    var newobject = document.createElementNS("http://www.w3.org/2000/svg", tag);
    $.extend(newobject, dali.graphicsextensions); // extend with all of our graphics extensions functions.
    newobject.initialize();
    newobject.svgparent = dom.svgparent;

    dom.appendChild(newobject);

    //accessor easy access to key attributes:
    newobject.__defineGetter__("left", function(){return newobject.realBBox().left;});
    newobject.__defineGetter__("right", function(){return newobject.realBBox().right;});
    newobject.__defineGetter__("top", function(){return newobject.realBBox().top;});
    newobject.__defineGetter__("bottom", function(){return newobject.realBBox().bottom;});

    //create a specialized dynamic attribute accessor function.
    //this function lets us take a localized variable and mirror it to set attributes to the SVG as if it were
    //an internal value.
    newobject.__setaccessors__ = function(_name, _init)
    {
      newobject.__defineGetter__(_name, function(){return newobject["_" + _name];});
      newobject.__defineSetter__(_name, function(val){$(newobject).attr(_name, val); return newobject["_" + _name] = val;});
      newobject[_name] = _init;
    }

    return newobject;
  },

  //common methods to all graphical objects.
  graphicsextensions:
  {
    initialize: function()
    {
      this.realmatrix = dali.matrix();
    },

    remove: function()
    {
      var parent = this.parentNode;
      parent.removeChild(this);
    },

    applytransform: function(transformation, clobber)  //have to rename this otherwise firefox chokes.
    {
      var oldtransform = $(this).attr("transform");
      var current = (clobber) ? "" : (oldtransform ? oldtransform : "");
      $(this).attr("transform", transformation.toString() + current);
      this.realmatrix = (clobber) ? transformation.matrix : this.realmatrix.multiply(transformation.matrix);
    },

    realmatrix: {},
    svgparent: {},

    realBBox: function()
    //this is a hack to find the real bounding box after all transformations have been completed.
    //correct function depends on no DOM elements being between the svg tag and the parent tag.
    {
      var thisbox = this.getBoundingClientRect();
      var parbox = this.svgparent.getBoundingClientRect();
      return dali.rrect(thisbox.left - parbox.left + this.svgparent.scrollLeft, thisbox.top - parbox.top + this.svgparent.scrollTop, thisbox.width, thisbox.height);
    }
  },

  Translate: function(x, y)
  {
    this.toString = function(){return "translate(" + x + "," + y + ")";};
    this.matrix = dali.matrix().translate(x, y);
  },

  Scale: function(x, y)
  {
    this.toString = (y) ? function(){return "scale(" + x + "," + y + ")";} : function(){return "scale(" + x + ")";}
    this.matrix = dali.matrix().scaleNonUniform(x, (y) ? y : x);
  },

  Rotation: function(t, x, y)
  {
    this.toString = (x && y) ? function(){return "rotate(" + t + "," + x + "," + y + ")";} : function(){ return "rotate(" + t + ")";}
    this.matrix = dali.matrix().translate(x,y).rotate(t).translate(-x,-y);
  },

  Skew: function(t, direction)
  {
    this.toString = function(){return "skew" + ((direction == "Y") || (direction == "y") ? "Y" : "X") + "(" + t + ")";}
    this.matrix = (direction == "Y") ? dali.matrix().skewY(t) : dali.matrix().skewX(t);
  }

  //MAKE FLIP AND CUSTOM MATRICES.
};

//add a few utility functions to the svgrect prototype

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
  if (box instanceof SVGRect) // check to make sure we have passed an SVGRect
  {
    return !((box.left > this.right) || 
             (box.right < this.left) || 
             (box.top > this.bottom) || 
             (box.bottom < this.top));
  }
}
