/* 
Minx.Panel 
==========

core class - all derived from this (not layouts)

some code could be written in shorthand forms - but I have sacrificed brevity for readability 
- all to often clever syntax just serves to confuse, and for little or no performnce gain 


*/



// geometry values 0 used by panel to - could be internal class?
// really to check for any geometry changes or dimension changes
Minx.Geom = function(){
    this.l = 0;
    this.t = 0;
    this.w = 10;
    this.h = 10;

    // make me the same as g
    this.clone = function(g) {
        var t = this;       // bit like using
        t.l = g.l;
        t.t = g.t;
        t.w = g.w;
        t.h = g.h;
    };

    // do I quack like a duck
    this.equal = function(g) {
        var t = this;           // bit like 'using' as well
        return (
            (t.l === g.l) &&
            (t.t === g.t) &&
            (t.w === g.w) &&
            (t.h === g.h)
        );
    };

    // am I as fat as g
    this.dimsEqual = function(g) {
        var t = this;           // plainly cant be arsed to c&p the word this 
        return (
            (t.w === g.w) &&
            (t.h === g.h)
        );
    };
};


// These litle classes are used to provide the markup for animations
// they are substituted for the functions...
// _setXY ==> setpos
// _setTime ==> settime

// these atre set up once at load time so no constant agent checking - there is no code to do the agent checking yet...


// Webkit accelerated animations

Minx.anim = {
    trans: '-webkit-transform',
    transpeed: '-webkit-transition-duration',

    getTranslate: function(x, y) {
        return 'translate3d(' + x + 'px,' + y + 'px, 0px)'   
    },

    setpos: function(pan, x, y) {
       pan.setStyle(Minx.anim.trans, this.getTranslate(x, y));
        
        /* use this event if we add animations
        pan.getNode().addEventListener( 'webkitAnimationEnd', function( event ) {
            console.log("anim finished " + event);
        } );
        */

/* FIXPOS 
        pan.getNode().addEventListener( 'webkitTransitionEnd', function( event ) {
            
            pan.getNode().removeEventListener( 'webkitTransitionEnd', this);   // this is this function i hope

            Minx.anim.fixpos(pan, x, y);

        } );
*/


   },
/* FIXPOS 
    fixpos: function(pan, x, y) {
        pan.removeStyle(Minx.anim.trans);
        pan.removeStyle(Minx.anim.transpeed);

        pan.setStyle('left', x + 'px');
        pan.setStyle('top' , y + 'px');
        
        // now blast this update now
        pan._blastStyles();
    },

*/

    settime: function(pan, speed) {

        if (speed == 0) {
            pan.removeStyle(Minx.anim.transpeed);

        } else {

            pan.setStyle(Minx.anim.transpeed, speed + 'ms');
        }
    }
};



// FireFox accelerated animations
/*
Minx.anim = {
    trans: '-moz-transform',
    transpeed: '-moz-transition-duration',
    setpos: function(pan, x, y) {
        pan.setStyle(Minx.anim.trans, 'translate(' + x + 'px,' + y + 'px)');   // TODO - investigate hwaccell for mozilla

        
    },
    settime: function(pan, speed) {
        if (speed == 0) {
            pan.removeStyle(Minx.anim.transpeed);

        } else {

            pan.setStyle(Minx.anim.transpeed, speed + 'ms');
        }
    }
};
*/


// None accelerated animations - left and right
// timings of transitions are specified in the CSS

/*
Minx.anim = {
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
    
    
    // Public API
    // ==========


    // Setters
    // =======


    // simple relative positioning where 0,0 is top left corner of my parent
    setPos: function(left, top) {

        this._newG.l = left;
        this._newG.t = top;
    },


    // specific size - but pinning overrides these values if we are an instance of a pinned panel
    setSize: function(width, height) {

        if (width >= 0)
            this._newG.w = width;
        
        if (height >= 0)
            this._newG.h = height;
    },


    // set the animation duration in ms
    // dont like smoth transitions? simples time = 0
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


    // extract a css class from my class list
    // cl = string css class to add to the list of classes for this panel
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


    // remove a style pair 
    // key - stlye name e.g. 'left', 'border' etc.
    removeStyle: function(key) {
        // make sure we do have this key before marking dirty
        if(key in this._style) {

            delete this._style[key];
            this._dirty = true;
        }
    },


    // when set visible this is the maximum opacity the panel will take 
    // opacity is a string
    setMaxOpacity: function(opacity) {

        this._maxOpacity = opacity;
    },


    setContentChanged: function(which) {

        this._contentChanged = which;
    },


    // Getters
    // =======

    // the dom node 
    getNode: function() {

        return this._node;   
    },


    // my managed id - this internal _id - is used as the dom id and is managed by the panel manager
    getId: function() {

        return this._id; 
    },


    // return my current dimensions object
    getDims: function() {

        return this._nowG;
    },


    // return my next dimensions object - this is normally more used for calculations
    getNewDims: function() {

        return this._newG;
    },


    // return my parent panel
    getParent: function() {

        return this._parent;  
    },


    // override for specific elements like title bar shoud be header
    // all panel classes derived from pinnedpanels should override this
    getMyElement: function() {

        return 'section';
    },


    // default class name (panel is allways added)
    // all panel classes derived from pinnedpanels should override this
    getClassName: function() {

        return 'panel';
    },

    // if there are any unnapplied styles
    isDirty: function() {

        return this._dirty;  
    },

    // a thing is hidden if it its visibility is set hidden or it is completely opaque
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

    isOnScreen: function() {
        // recurse up my chain to work out if im on screen (or at least rendrered on dom)
        if(this.isHidden()) {

            return false;
        }
        else if(this.getParent() != null) {

            return this.getParent().isOnScreen();
        }
        else {

            return true;        // run out of parents and no explicit hidden so must be on screen
        }
    },

    // utility to count any kiddies in the kiddie hash - a more optimal way??
    kiddieCount: function() {

        var count = 0;

        for(var kid in this._kidies) {

            count++;
        }

        return count;
    },


    hasContentChanged: function() {

        var hasit = this._contentChanged;

        if (!hasit) {          // if ours hasnt then recurse to check all kids
            
            for (var kid in this._kidies) {
                    
                hasit = this._kidies[kid].hasContentChanged();

                if (hasit) {

                    break;          // stop if we find one
                }
            }
        }

        return hasit;
    },


    // little utility to return the panel id's in this tree
    reportLineage: function(mid) {
        mid = mid || "";
        if (this.getParent()) {
            return this.getParent().reportLineage(mid + " - " + this.getId());
        }
        else {
            return mid + " - " + this.getId();
        }
    },


    
    // Actions
    // =======
    
    // event 
    // -----
    // events that my derived classes might like to know bout 

    // This gets called when my geometry changed - override it to do some resizing based activity or set a listener 
    resized: function() {
        if (this._resizeListener) {   
            this._resizeListener();
        }
    },


    // set up a function to listen to any resized events
    onResized: function(fn) {

        this._resizeListener = fn;
    },


    // This gets called when my node gets added back to the dom
    // override 
    reattached: function() {
        // pass
    },


    // register a handler for all my default events
    // the function passed in here gets passed the parsed event 
    // but subclasses may override on event and perhaps not call the base eventFired
    onEvents: function(fn) {

        this._eventListener = fn;
    },

    
    // override this to extract something specific from the event to pass to any listeners
    // important to return a parameter object containing {e: event as a minimum}
    // event is the raw dom event
    eventParse: function(event) {

        if (event.currentTarget != undefined) {

            return {id: event.currentTarget.id, e: event};

        }
        else {

            return {id: this.getId(), e: event};   
        }
    },


    //@protected - used by Minx.Events 
    // events are all wrapped in Minx.events and stored in the (misleadingly named, as it is not a queue, just a list) Minx.eq
    // the pm tells the panel via this function that an event handler has been created
    // TODO this could be used to destroy the events when this panel is destroyed - it does not yet, so is a bit of a leak, but trivial
    // the event tripple is..
    //    node - is probably my own node but does not have to be if my panel handles events from other nodes
    //    ev   - the dom event attached to 
    //    mEv  - the event wrapper containing the 'trigger' function which is the thing actually attached to the dom - the trigger then calls the callback on this panel
    //         - which by default is the reserved function  
    addEvent: function(eventTripple) {

        this._events.push(eventTripple);
    },
    

    removeEvent: function(eventTripple) {

        for (mev in this._events) {

            var ev = this._events[mev];
            
            if ((ev.node == eventTripple.node) && (ev.ev == eventTripple.ev) && (ev.mEv == eventTripple.mEv)) {

                this._events.splice(mev, 1);        
            }
        }
    },


    // @protected - override eventParse instead
    // the default callback for all subscribed events via Minx.eq
    eventFired: function(event) {
        // pass down to kids who may want to extract something specific from the event
        var myEv = this.eventParse(event);

        if(this._eventListener) {

            this._eventListener(this, myEv);
        }  
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
   ---> this._mapAllStuff();


draw() - checks if the dirty flag indicting drawable changes and adds my changes to the dom, and recursively checks child panels
  |
   ---> _applyStyles() - this actually changes the dom - converts everyand triggers browser rendering 
   |
    ---> drawKids()



_applyStyles()   - maps all the panel properties into classes and styles and then writes them to the dom 
    |
     ---> _mapAllStuff();
    |         |
    |          -----> _mapAnim();           - sets classes and styles to enable or disable animation
    |         |
    |          -----> _mapGeometry();       - takes my current size and position and adds it to the style map, ready to be sent to the DOM
    |
     ---> _blastStyles();                   - writes classes and styles to the dom

*/




    // show - does the whole shebang if needed
    // quite a biggy - triggers a layout, then a draw, to actually apply to the dom
    // set visible, apply geometry to style, and finally syle the node with it all
    show: function(pars) {
        pars = pars || {};
        var fadein = pars.fade;

        // if we are masked show the mask 
        if (this.mask) {
           this.mask.show();
        }

        // make sure the hide wont still be called
        clearTimeout(this._hideTimer);

        // we need to force a redraw on any reattaching panels incase there is an iscroll component which needs to be completely rendered 
        // before it can get its own dimensions so if it has dynamic content then the new content needs to be available and it needs to be in the dom so each 
        // element in the iscrol list can be rendered corectly so iscroll can detect correct size and do its thing
        // it is upto subclass panels to setContentChanged so we know to force a full redraw down to the iscroll containing child        
        // this changed content thing - is only really needed for panels with iscrol and which detatch from the dom
        // so we will force a redraw if me or any kids have explicitly marked content changed
        var force = this.hasContentChanged();

        if (fadein) {
            // make sure we are initially faded out
            this.setStyle('opacity', '0');
            this._applyStyles();                            // update the dom with zero opacity
        }
        
        // add it to the dom first - so iscroll can layout properly
        if (this._detached) {

            this._parent._addToDom(this);
            this._detached = false;

            this.reattached();                                              // fire any re-attach callbacks - perhaps could use this for any iscrol panles
        }

        // set visible - inherit the parents visibility
        this.setStyle('visibility', 'inhertied');

        // and set the panel back to its maximum opacity
        this.setStyle('opacity', this._maxOpacity);

        var me = this;

        // timer trick to make sure the opacity 0 is rendered for the fade in
        if (fadein) {
            setTimeout(function() {
                me.render(force);
            }, 10);
        }
        else{
            me.render(force);
        }
    },


    // render lays it out and calls draw to draw it in the dom
    render: function(force) {
        // apply my layout (if my dimensions have changed then my kids get layed out too)
        // dont fret - calling this is efficient, calls the small linnear pinning algorithms
        this.layout(force);

        // draw to the browser - and tell it about my dirty kids, draw only does something iif there is a change
        this.draw(force);        
    },


    // apply the geometry to our css style map - (only actually actioned after a call to _applyStyles)
    // first check how I am altered by my parent based on parent pinning
    // then if pinning changed anything
    // check if my size changed (newDims) 
    layout: function(force) {

        //check if geometary changed or we are forcing it to update the dom
        if (!this._nowG.equal(this._newG) || force) {
            
            //this._mapAllStuff();

            // need to test to see if actual dimensions have changed
            var newDims = !this._nowG.dimsEqual(this._newG); 

            // if my new dimensions have changed - then ask my kids to lay themselves out - if my dims havent changed then thier positions relative to me wont have changed
            if (newDims || force) {

                for (var kid in this._kidies) {
                    
                    this._kidies[kid].layout(force);
                }  
                
                this.resized();
            }            
        }
    },

    // just hide this panel - kids inherit hidden, so no real need to tell kids anything
    // hiding does not affect the dom
    // instant  = hide at same time as opacity - so no transition on visibility so instant hide, no timing issues
    // detach - take it out of the dom

    detach: function() {

        if (!this._detached) {

            this._parent._node.removeChild(this._node);
            this._detached = true;
        }
    },


    hide: function(pars) {

        var instant = (pars && pars.now) ? pars.now : false;
        var detach = (pars && pars.detach) ? pars.detach : false;
        
        // set hidden
        var me = this;
        // even if instant set opacity to zero so we can fade up on show

        //DEBUG - look into rumour that removing opacity improves hw accell
        this.setStyle('opacity', '0');

        // instant hide - no fading?
        if (instant) {

            me.setStyle('visibility', 'hidden');

            // want me off the dom too, and I'm not already
            if (detach) {
                me.detach();
            }

        }
        else {
            // must hide as well but only after enough time for the opacity animation - got a reference on this timer to cancel if show called before transition finished
            // otherwise we could have the situation where we hide and show within _animate time and this timer still fires the hide!
            this._hideTimer = setTimeout(function(det) {

                me.setStyle('visibility', 'hidden');    
                // tell the browser
                me._applyStyles();

                // want to detach fully and is not allready detached
                if (det[0]) {

                    me.detach();
                }

            }, this._animate, [detach]);        // fade after whatever the animation time is
        }

        // tell the browser about first change
        this._applyStyles();
    },


    // if i'm dirty I shal clean myself by building a cssstyle and telling the browser
    // then make sure my kids do the same
    // because there is every chance some of them are pinned to me and since i changed so did they
    // if they aren't diry then no biggy - do nothing 
    draw: function(force) {
        
        if(this._contentChanged) {
            // mark our content as being clean - only if it is visible - therefore fully drawn

            if (this.isOnScreen()) {                        // onscreen checks all parent visibility hence we only bother if the content is marked as changed

                this.setContentChanged(false);
            }
        }
        
        // apply my styles to the dom - sets dirty if any have changed
        this._applyStyles(force);
        
        // now ask my kids  to do the same if they are dirty
        this.drawKids(force);
    },


    drawKids: function (force){

        for (var kid in this._kidies) {

            this._kidies[kid].draw(force);
        }
    },


    // does the normal dom drawing - only called by draw()
    // force current geometry (killing any animation in progress)
    // sets up new animation
    // sets up new geometry
    // and blasts it to the dom
    _applyStyles: function(force) {
        
        // if I have new Geometry; a change in size or position...
        // add my new geometry to the style map to be applied when I get drawn
        if (!this._nowG.equal(this._newG) || force) {

            this._mapAllStuff(); 
        }
        
        // and update the dom with these new geom changes
        this._blastStyles();
    },


    // private - make sure my new geometry is in the style map - which ultimately gets set on the style text of my node via _applyStyles
    // passing in the deltas as calculated earlier - required for the transform 
    // maps all the new geometry into the sets of styles that will be applied on next draw
    _mapAllStuff: function() {

        // this._instantFirstDraw indicates that this is the first time this panel has been put on screen
        // so this is setting up its inital starting position - and will (likely) be initially hidden
        this._mapAnim();
        
        // coords and dimensions
        this._mapGeometry();
    },


    _mapAnim: function() {

        // apply transition animations only if not first draw && (difx > 0 || dify > 0)
        if (this._instantFirstDraw || (this._animate <= 0)) {

            this._setTime(this, 0);
            this.removeClass('anim-geom');

        } 
        else {

            this.addClass('anim-geom');
            this._setTime(this, this._animate);
        }

        this._instantFirstDraw = false;                                 // TODO only clear this after it is blasted
    },


    _mapGeometry: function() {
        // add the new coords
        this._setXY(this, this._newG.l, this._newG.t);
        
        // apply new dimensions 
        if (this._newG.w == 0 && this._newG.h == 0) {

            this.removeStyle('width');
            this.removeStyle('height');

        } 
        else {

            this.setStyle('width',  this._newG.w + 'px');
            this.setStyle('height', this._newG.h + 'px');
        }

        // now we can with some confidence say that our dimensions have been applied so update NowG
        // nowG does not mean that it has been applied to the DOM yet - but it will be very soon
        this._nowG.clone(this._newG);
    },

    
    // default coordinate and animation function
    
    _setXY: function(pan, x, y){ 
         
        var dim = pan.getDims();

        if ((dim.l != x) || (dim.t != y)) {

              Minx.anim.setpos(pan, x, y);

/* FIXPOS 
            // call the specific browser functions
            if( pan._animate == 0) {
                Minx.anim.fixpos(pan, x, y);
            }
            else {
                Minx.anim.setpos(pan, x, y);
            }
ENDFIXPOS */

         }
    },


    _setTime: function(pan, speed) {

        Minx.anim.settime(pan, speed);
    },
    

    // private - make the style string from my map of styles - and set it on the node
    // apply the new Geometry
    _blastStyles: function() {

        // any of our style or position changed
        if (this._dirty) {

            // compose the class 
            var cText = "";
            var hasClass = false;
            
            for (cl in this._classes) {
            
                cText += cl + " ";
                hasClass = true;
            }

            // if we have any class 
            if (hasClass) {
                // then trust the css and remove any styly stuff
                // this.removeStyle('background-color');
                // add the class attributes
                this._node.setAttribute('class', cText);
            }

            // compose the style string from the hash of style attributes
            var sText = ""

            for (key in this._style) {

                sText += key + ": " + this._style[key] + "; ";
            }

            // this does the dead and changes the style in the dom thereby triggering the browser to redraw the node
            // DEBUG console.log("Blasting Styles: " + this.getId() +"   class: [" + cText + "]   style: [" + sText + "]");
            this._node.style.cssText = sText;
        }

        // tell every one I'm clean
        this._dirty = false;
    },


    // private - set up any default values
    // should padding and shit be set here - NO that should be a external style thing
    _setDefaultStyle: function(panel) {

        panel.addClass('panel');
        
        if (Minx.pm.dims.phone) {

            panel.addClass('phone');
        }

        if (Minx.pm.dims.retina) {

            panel.addClass('retina');
        }
        
        this.addClass(this.getClassName());                  // overridden to apply specific class
        panel.setStyle('visibility', 'inherited');
        panel.setStyle('position', 'absolute');
        // panel.setStyle('background-color','#eeeeee');
    },


    // Structural internal stuff
    // =========================

    // set up my most important members
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

        this._dirty = true;              // has anything changed that requires me to update my style attributes in th dom - obviously a new panel i dirty
        
        this._animate = 500;             // transition time in ms - enabe full animation by default with duration 500
        
        this._instantFirstDraw = true;   // pesky once off flag to say if this is the first drawing and we want it to be blasted with no animation

        this._detached = true;           // initially all are detached

        this._maxOpacity = '1';            // opup spinner panel for example might not be solid

        this._contentChanged = false;     // inherited panels and helpers set this particularly when the pane has content dependant on external data and that data has changed (listscrol for example)


        // SPECIAL - have we just made the root node - dont create nodes
        if (id == "root") {

            this._node = document.body;

        } else {      // normal node so create it 

            this._create();
        }
    },


    // @protected-ish
    // @friend Minx.PanelManager 
    //
    // remove my kids bottum up then me from my parent
    // normally this should not be called - instead panel deletion should be called from the panel manager, via remove
    removeMe: function() {

        return this._parent._removeKid(this);
    },

    
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
        this._parent._addKid(this);

        // TODO - dont add the top level on create  - as each child may cause a dow redraw - but if visibility hidden - should be ok
        this._parent._addToDom(this);

        // mark it as attached
        this._detached = false;
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
    // called from the constructor
    _addKid: function(panel) {

        // check to see if we have this node allready in my list of childs
        if (panel.getId() in this._kidies) {
            // cant add a duplicate panel - cant replace one implicitly - need explicit delete first soo...
            // raise an exception
            throw 'duplicate panel id' +  panel.getId();
        }

        // now add our child panel - to our child list
        this._kidies[panel.getId()] = panel;    
    },


    //@private
    // remove a child by first recursively removing my children
    // then removing my node from the dom
    // taking this child out of my child list
    // and return the list of id's removed
    _removeKid: function(panel) {
        // get rid of my kids
        var list = panel._removeKids();

        // now remove child from my node
        try {
            panel.detach();
            //this._node.removeChild(panel.getNode());
        }
        catch(e) {
            console.error(e);
            console.log(panel.getId());
            console.log(panel.getNode().innerHTML); 
        }

        // and delete from my panel list
        delete this._kidies[panel.getId()];

        // add myself to the list of keys removed
        list.push(panel.getId());

        return list;
    },


    //@private
    // itterate my kid panels and remove them recursively
    // return the list of panel id's the got removed
    _removeKids: function() {

        var list = [];

        for (var kid in this._kidies) {

            keys = this._removeKid(this._kidies[kid]);
            list = list.concat(keys);
        } 

        return list;
    },


    //and add the node from the passed panel to the dom as a child of my node
    _addToDom: function(panel) {

        this._node.appendChild(panel.getNode());
    },



//********************************************
    // All the following are !! BROKEN !! and not used now - it was really an experiment
    // can completely reconstruct the dom from the panel tree
    // but *WITHOUT EVENTS* at the moment
    // the clonenode with depth will recreate widget content - but again no evetns get cloned
    _rebuildMyDom: function (add) {

        if (this.kiddieCount() == 0) {

            var newnode = this._node.cloneNode(true);
        }
        else {

            var newnode = this._node.cloneNode(false);
        }

        this._node = newnode


        // total recreation - but does not create the widget markup
        //this._node = document.createElement(this.getMyElement());         // the dom node - or el really
        //this._node.setAttribute('id', this._id);

        
        // just update my dom with current styles - client can change size and call layout 
        //this._dirty = true;
        //this._blastStyles();


        for (var kid in this._kidies) {

            this._kidies[kid]._rebuildMyDom(true);
        }


        if (add) {

            this._parent._addToDom(this);

            this._detached = false;
        }
    },


    // the public function
    domReAttach: function() {

        var me = this;
            
        me._parent._addToDom(me);
        this._detached = false;

        setTimeout(function() {
            // and remove my old one
            me._parent._node.removeChild(me._oldNode);
        
        }, 1000);
        
    },


    // the public function
    domReCreate: function() {

        this._oldNode = this._node;

        // add it to my parent
        this._rebuildMyDom(false);
    }
});


Minx.pm.register('simple', Minx.Panel);

