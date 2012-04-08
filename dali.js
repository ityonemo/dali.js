////////////////////////////////////////////////////////////////////////
// dali.js
// - a framework for cleanly manipulating SVG using Javascript and jQuery.
// jQuery is required for this to work.  The developer is responsible for
// supplying either jQuery.js or an equivalent framework to support the
// jQuery functions used by svg.js.

var dali = 
{
  //creates and returns an SVG DOM object.
  SVG: function(parent, _width, _height)
  {
    //create the object in the DOM.
    var svgobject = document.createElementNS("http://www.w3.org/2000/svg","svg");
    //set the important svg properties.
    $(svgobject).attr("version", "1.1");
    $(svgobject).css("overflow-x","hidden").css("overflow-y","hidden").css("position","relative");
  
    //set the width and height, if applicable.
    if ((_width) && (_height))
      $(svgobject).attr("width", _width).attr("height", _height);

    $.extend(svgobject,
    {
      width: _width,
      height: _height,
      resize: function(__width, __height) //use double underscore to disambiguate from the passed params in outer function.
      { //set our variables.
        this.width = __width; this.height = __height; 
        //set our attributes in the DOM.
        $(this).attr("width", __width).attr("height", __height);
        return this;
      },
    });

    //use jQuery to cleanly extend the SVG dom object.
    $.extend(svgobject, dali.creatorextensions)

    //attach it to the parent.
    parent.appendChild(svgobject)
 
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
      textobject.__setaccessors__("text", text);
      return textobject;
    },

    group: function()
    {
      var groupobject = dali.create("g", this);
      $.extend(groupobject, dali.creatorextensions);
      return groupobject;
    }
  },

  //create svg object function
  create: function (tag, dom)
  {
    var newobject = document.createElementNS("http://www.w3.org/2000/svg", tag);
    $.extend(newobject, dali.graphicsextensions); // extend with all of our graphics extensions functions.
    dom.appendChild(newobject);

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
  },

  BBox: function(_x1, _y1, _x2, _y2)
  {
    $.extend(this,
    {
      //basic variables of the BBox.
      left: Math.min(_x1, _x2),
      top: Math.min(_y1, _y2),
      right: Math.max(_x1,_x2),
      bottom: Math.max(_y1,_y2),

      //check to see if another BBox or a point lies within this BBox.
      contains: function(x, y)
      {
        return (isNaN(x) ?
          ((x.left >= this.left) && (x.right <= this.right) && (y.top >= this.top) && (y.bottom <= this.bottom)) : //assume it's anotherbbox.
          ((x >= this.left) && (x <= this.right) && (y >= this.top) && (y <= this.bottom)));                       //assume it's a point.
      },

      //check to see if another BBox overlaps this BBox.
      overlaps: function(box)
      { //overlapping is merely the opposite of being completely disjoint.
        return !((box.left > this.right) || (box.right < this.left) || (box.top < this.bottom) || (box.bottom > this.top));
      }
    });

    //jQuery extend doesn't transfer getters and setters, so we have to use this.
    this.__defineGetter__("width",function() {return this.right - this.left;});
    this.__defineGetter__("height",function() {return this.bottom - this.top;});
    this.__defineSetter__("width",function(val){this.right = this.left + val;});
    this.__defineSetter__("height",function(val){this.right = this.left + val;});
  }
}
