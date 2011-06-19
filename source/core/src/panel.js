/* panel */

// geometry values 0 used by panel to - could be internal class?
// really to check for any geometry changes or dimension changes
Minx.Geom = my.Class({
    l: 0,
    t: 0,
    w: 100,
    h: 100,

    // make me the same as g
    clone: function(g) {
        var t = this;       // bit like using
        t.l = g.l;
        t.t = g.t;
        t.w = g.w;
        t.h = g.h;
    },

    // do I quack like a duck
    equal: function(g) {
        var t = this;           // bit like 'using' as well
        return (
            (t.l === g.l) &&
            (t.t === g.t) &&
            (t.w === g.w) &&
            (t.h === g.h)
        );
    },

    // am I as fat as g
    dimsEqual: function(g) {
        var t = this;           // plainly cant be arsed to c&p the word this 
        return (
            (t.w === g.w) &&
            (t.h === g.h)
        );
    }
});


// Webkit accelerated animations


Minx.anim = {
    trans: '-webkit-transform',
    transpeed: '-webkit-transition-duration',
    setpos: function(pan, x, y) {
        pan.setStyle(Minx.anim.trans, 'translate3d(' + x + 'px,' + y + 'px, 0px)');

        
    },
    settime: function(pan, speed) {
        pan.setStyle(Minx.anim.transpeed, speed + 'ms');
    }
};



// None accelerated animations
/*
Minx.anim = {
    trans: '-webkit-transform',                     // this setting not used in none accel
    setpos: function(pan, x, y) {
        pan.setStyle('left', x + 'px');
        pan.setStyle('top',  y + 'px');
    },
    settime: function(pan, speed) {
    }
};

*/

// the seat of all power - THE PANEL
// keeps a list of all child panels
// builds up new geometry to decide ifa change is needed
// holds a reference to its dom node


Minx.Panel = my.Class({
    
    constructor: function (parent, id) {
        this._parent = parent;           // parent panel
        this._id = id;                   // my managed id   
        this._hideTimer = null;          // a timer to set hidden after transitioning to full transparency
                                         // which needs clearing on show - else a timed hide could still happen 

        this._kidies = {};               // my map of child panels
        
        this._style = {};                // my map of css style elements, no duplicates for me - used to compose the style string
        this._classes = {};

        this._events = [];               // array of events i have subscribed to
        
        this._nowG = new Minx.Geom();    // my geometry now
        this._newG = new Minx.Geom();    // my geometry to be

        this._dirty = false;             // has anything changed that requires me to update my style attributes in th dom

        this._animate = 500;             // enabe full animation by default with duration 500
        
        this._firstDraw = true;          // pesky once off flag to say if this is the first drawing


        // SPECIAL - have we just made the root node - dont create nodes
        if(id == "root") {
            this._node = document.body;
        }
        else {      // normal node so create it 
            this._create();
        }
    },

    // Structural stuff
    // ================

    // create my panel details
    // mainly the dom node - and add me to my parent
    _create: function() {
        // create the node and set the managed id
        this._node = document.createElement(this.getMyElement());         // the dom node - or el really
        this._node.setAttribute('id', this._id);

        // set some default styles
        this._setDefaultStyle(this);
        
        // any sppecific setup overrides
        this._onCreation();  
                
        // add myself to my parent - maintaining panel tree
        this._parent.addKid(this);

        this._parent._addToDom(this);
    },

    // override this to set up any initial positioning before being added to the dom
    // this gets called after all other defaults so takes precidence
    _onCreation: function() {
        //default  sizes and positions
        this.setSize(100, 100);
        this.setPos(0,0);
    },

    
    // this adds the panel to our kids list and 
    // appends the new dom node to my node
    addKid: function(panel) {
        // check to see if we have this node allready in my list of childs
        if(panel.getId() in this._kidies) {
            // cant add a duplicate panel - cant replace one implicitly - need explicit delete first soo...
            // raise an exception
            throw 'duplicate panel id' +  panel.getId();
        }

        // now add our child panel - to our child list
        this._kidies[panel.getId()] = panel;

        
    },

    addEvent: function(eventTripple) {
        this._events.push(eventTripple);
    },

    _addToDom: function(panel) {
        //and add the panels node to the dom as a child of my node
        this._node.appendChild(panel.getNode());
    },

    // almost a delete, but just remove me from my parent
    removeMe: function() {
        return this._parent.removeKid(this);
    },

    // remove a child by first recursively removing my children
    // then removing my node from the dom
    // taking this child out of my child list
    // and return the list of id's removed
    removeKid: function(panel) {
        // get rid of my kids
        var list = panel.removeKids();

        // now remove child from my node
        this._node.removeChild(panel.getNode());

        // and delete from my panel list
        delete this._kidies[panel.getId()];

        // add myself to the list of keys removed
        list.push(panel.getId());

        return list;
    },

    // itterate my kid panels and remove them recursively
    // return the list of panel id's the got removed
    removeKids: function(){
        var list = []
        for(var kid in this._kidies) {
            keys = this.removeKid(this._kidies[kid]);
            list = list.concat(keys);
        } 

        return list;
    },


    // setters
    // =======

    // simple relative positioning where 0,0 is top left corner of my parent
    setPos: function(left, top) {
        this._newG.l = left;
        this._newG.t = top;
    },

    // specific size - but pinning overrides these
    setSize: function(width, height) {
        this._newG.w = width;
        this._newG.h = height;
    },

    // dont like smoth transitions? simples
    setAnimate: function(time) {
        this._animate = time;
    },

    // add a css class - 'class' a reserved word on gecko
    addClass: function(cl) {
        // check that we dont allready have this class
        if(!(cl in this._classes)) {
            this._classes[cl] = true;
            this._dirty = true;
        }
    },

    removeClass: function(cl) {
        // make sure we have it before we dirtyfy things
        if(cl in this._classes) {
            delete this._classes[cl]; 
            this._dirty = true;
        }
    },

    // add a style pair - which will end up on the style attribute after a call to _applyStyles
    // this is used to set geometry and everything
    // if the this._style list changes then we are dirty - so need a redraw
    setStyle: function(key, val) {
        // check we dont have this style or if we do that it is for a different value
        if(!(key in this._style) || (this._style[key] !== val)) {
            this._style[key] = val;  
            this._dirty = true;
        }
    },

    removeStyle: function(key) {
        // make sure we do have this key before marking dirty
        if(key in this._style) {
            delete this._style[key];
            this._dirty = true;
        }
    },

    // getters
    // =======

    // the dom node 
    getNode: function() {
        return this._node;   
    },

    // my managed id
    getId: function() {
        return this._id; 
    },

    // return my current dimensions object
    getDims: function() {
        return this._nowG;
    },

    // return my next dimensions object
    getNewDims: function() {
        return this._newG;
    },

    getParent: function() {
        return this._parent;  
    },

    // override for specific elements like title bar shoud be header
    getMyElement: function() {
        return 'section';
    },

    getClassName: function() {
        return 'panel';
    },

    isDirty: function() {
        return this._dirty;  
    },
    
    isHidden: function() {
        var hidden = false;
        if('visibility' in this._style) {
            if(this._style['visibility'] === 'hidden') {
                hidden = true;
            }
        }

        if('opacity' in this._style) {
            if(this._style['opacity'] == '0') {
                hidden = true;
            }
        }
        return hidden;
    },

    // events that my derived classes might like to know bout 
    resized: function() {
        // pass
    },

    // actions
    // =======
    
    // event 
    // -----
    //register a handler for all my events
    onEvents: function(fn) {
        this._eventListener = fn;
    },
    
    // kind a protected - override eventParse instead
    eventFired: function(event) {
        // pass down to kids who may want to extract something specific from the event
        var myEv = this.eventParse(event);
        if(this._eventListener) {
          this._eventListener(this, myEv);
        }  
    },

    // override this to extract something specific from the event to pass to any listeners
    // importat to return a parameter object containing {e: event as a minimum}
    eventParse: function(event) {
        return {e: event};
    },
    
/* 
Laying out Drawing and Rendering
================================

show()  - is the main api call a client will make
  |
  ---> sets the node visible and opaque of this node only no children
      |
      ---> render()

hide()  - show()'s counterpart sets opacity 0 and after enough time for opacity transition (fade) to occur sets visibility hidden
  |
  --->  _applyStyles()  - calls this directly as no geometry changed just want to hide 

render() - will layout the panel and 'draw' it to the dom with current settings
  |
  ---> layout ()
  |
  ---> draw ()


the three above are the most likely to be used by the client - the rest may be usefull to override

layout() - checks for new geometry and if the actual dimensions have changed (not postion) recursively layout child panels - gets things ready for drawing
  |
  ---> _mapMyGeometry()


draw() - checks if the dirty flag indicting drawable changes and adds my changes to the dom, and recursively checks child panels
  |
  ---> _applyStyles() - CHANGE the DOM STYLE string!! - this actually changes the dom - and triggers browser rendering 


_mapMyGeometry() - simply takes my current size and position and adds it to the style map, ready to be sent to the DOM

_applyStyles()   - takes the style map as created from _mapMyGeometry, and any other setStyle() calls, like visibility

*/




    // show - does the whole shebang if needed
    // quite a biggy - triggers a layout, then a draw, to actually apply to the dom
    // set visible, apply geometry to style, and finally syle the node with it all
    show: function() {
        // make sure the hide wont still be called
        clearTimeout(this._hideTimer);
        // set visible - inherit the parents visibility
        this.setStyle('visibility', 'inhertied');

        //DEBUG - remove opacity for hw accell
        //this.setStyle('opacity', '1');

        
        // make sure it is rendered
        this.render();
    },


    // render lays it out and calls draw to draw it in the dom
    render: function() {
        // apply my layout (if my dimensions have changed then my kids get layed out too)
        // dont fret - calling this is efficient, calls the small linnear pinning algorithms
        this.layout();

        // draw to the browser - and tell it about my dirty kids, draw only does something iif there is a change
        this.draw();        
    },


    // apply the geometry to our css style map - (only actually actioned after a call to _applyStyles)
    // first check how I am altered by my parent based on parent pinning
    // then if pinning changed anything
    // check if my size changed (newDims) 
    layout: function() {

        //check if geometary changed
        if(!this._nowG.equal(this._newG)) {

            this._mapAllStuff();

            // need to test to see if actual dimensions have changed
            var newDims = !this._nowG.dimsEqual(this._newG); 

            // if my dimensions have changed (as checked before the clone) - then ask my kids to lay themselves out
            if(newDims) {
                for(var kid in this._kidies) {
                    this._kidies[kid].layout();
                }  
                
                this.resized();
            }            
        }
        // nowG does not mean that it has been applied to the DOM
        this._nowG.clone(this._newG);
    },


    // just hide this panel - kids inherit hidden, so no real need to tell kids anything
    // hiding does not affect the dom
    // instant  = hide at same time as opacity - so no transition on visibility so instant hide, no timing issues
    hide: function(instant) {
        // set hidden
        var me = this;
        // even if instant set opacity to zero so we can fade up on show

        //DEBUG - remove opacity for hw accell
        //this.setStyle('opacity', '0');

        if(instant){
            me.setStyle('visibility', 'hidden');
        }
        else {

            // must hide as well but only after enough time for the animation - got a reference on this timer to cancel if show called before transition finished
            // otherwise we could have the situation where we hide and show within .3s and this timer still fires the hide!
            this._hideTimer = setTimeout(function() {
                me.setStyle('visibility', 'hidden');    
                // tell the browser
                me._applyStyles();
            }, 300);        // annoyingly kinda dependant on the 0.3s value in the css
        }
        // tell the browser about first change
        this._applyStyles();
    },


    // if i'm dirty I shal clean myself by building a cssstyle and telling the browser
    // then make sure my kids do the same
    // because there is every chance some of them are pinned to me and since i changed so did they
    // if they aren't diry then no biggy - do nothing 
    draw: function(kidsonly) {

        // apply my styles to the dom - sets dirty if any have changed
        this._applyStyles();
        
        // now ask my kids  to do the same if they are dirty
        this.drawKids();

    },


    drawKids: function (){
        for(var kid in this._kidies) {
            this._kidies[kid].draw();
        }
    },


    // does the normal dom drawing - only called by draw()
    // force current geometry (killing any animation in progress)
    // sets up new animation
    // sets up new geometry
    // and blasts it to the dom
    _applyStyles: function() {
        
        // if I have new Geometry...
        // add my new geometry to the style map to be applied when I get drawn
        if(!this._nowG.equal(this._newG)) {
            this._mapAllStuff(); 
        }
        
        // and update the dom with these new geom changes
        this._blastStyles();
    },


    // private - make sure my new geometry is in the style map - which ultimately gets set on the style text of my node via _applyStyles
    // passing in the deltas as calculated earlier - required for the transform 
    // maps all the new geometry into the sets of styles that will be applied on next draw
    _mapAllStuff: function() {

        // this._firstDraw indicates that this is the first time this panel has been put on screen
        // so this is setting up its inital starting position - and will (likely) be initially hidden

        this._mapAnim();
        
        // coords and dimensions
        this._mapGeometry(this._newG);
        
    },


    _mapAnim: function() {
        // apply transition animations only if not first draw && (difx > 0 || dify > 0)
        if(this._firstDraw || (this._animate <=0)) {
            this._setTime(this, 0);
            this.removeClass('anim-geom');
        }
        else
        {
            this.addClass('anim-geom');
            this._setTime(this, this._animate);
        }

        this._firstDraw = false;
    },


    _mapGeometry: function(geo) {
        // add the new coords
        this._setXY(this, this._newG.l, this._newG.t);
        
        // apply new dimensions 
        if(this._newG.w == 0 && this._newG.h == 0) {
            this.removeStyle('width');
            this.removeStyle('height');    
        } else {
            this.setStyle('width',  this._newG.w + 'px');
            this.setStyle('height', this._newG.h + 'px');
        }
    },

    
    // default coordinate and animation function
    
    _setXY: Minx.anim.setpos,
    _setTime: Minx.anim.settime,
    

    // private - make the style string from my map of styles - and set it on the node
    // apply the new Geometry
    _blastStyles: function() {
        // any of our style or position changed
        if(this._dirty) {
            // compose the class 
            var cText = "";
            var hasClass = false;
            for(cl in this._classes) {
                cText += cl + " ";
                hasClass = true;
            }

            // if we have any class 
            if(hasClass) {
                //- then trust the css and remove any styly stuff
                this.removeStyle('background-color');
                // add the class attributes
                this._node.setAttribute('class', cText);
            }

            // compose the style string from the hash of style attributes
            var sText = ""
            for(key in this._style) {
                sText += key + ": " + this._style[key] + "; ";
            }

            // this does the dead and changes the style in the dom thereby triggering the browser to redraw the node
            // DEBUG console.log("Laying out: " + this.getId() +"   class->" + cText + "<-   style: ->" + sText);
            this._node.style.cssText = sText;

        }
        // tell every one I'm clean
        this._dirty = false;
    },


    // private - set up any default values
    // should padding and shit be set here - NO that should be a external style thing
    _setDefaultStyle: function(panel) {
        panel.addClass('panel');
        this.addClass(this.getClassName());                  // overridden to apply specific class
        panel.setStyle('visibility', 'inherited');
        panel.setStyle('position', 'absolute');
        panel.setStyle('background-color','#eeeeee');
    }
});

Minx.pm.register('simple', Minx.Panel);