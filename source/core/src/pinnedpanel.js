/* panel */

// geometry values 0 used by panel to - could be internal class?
// really to check for any geometry changes or dimension changes

// ikle object to store a sibling to pin me to and an offset
Minx.PinTo = function(){
    this.off = 0;           // the offset
    this.panel = null;      // the panel to pin to
}

// the seat of all power - THE PANEL
// keeps a list of all child panels
// builds up new geometry to decide ifa change is needed
// holds a reference to its dom node

Minx.PinnedPanel = my.Class(Minx.Panel, {

    constructor: function(parent, id) {

        Minx.PinnedPanel.Super.call(this, parent, id);

        this._pinned = {};               // my map of any panels pinned to me
        
        // parent pin - pinning to parent -1 = no pinning, 0 = pin with no offset, > 0 pin with offsets 
        this._pPin = {'l': -1, 't': -1, 'r': -1, 'b': -1};   // where to pin me to my parent - no where by default, left, top, right, bottom
        
        // sibling pin - pin to a referenced panel + offset
        this._sPin = {'l': null, 't': null, 'r': null, 'b': null};   // where to pin me to my parent - no where by default, left, top, right, bottom
        
    },

    //** Parent pinning setters
    
    // are you my mummy! pin 'l' = left edge of my parent 
    setParentPin: function(which, offset) {
        if (typeof offset == "undefined") {
            offset = 0;
        }
        this._pPin[which] = offset;
    },

    unsetParentPin: function(which) {
        this._pPin[which] = -1;
    },

    // all in one go
    pinParent: function(wot) {
        this._pPin.l = wot.l;
        this._pPin.t = wot.t;
        this._pPin.r = wot.r;
        this._pPin.b = wot.b;
    },
    
    //** Sibling pinning setters
    // sibling - the pannel to pin (said peter piper) 
    // which - 'l'eft, 't'op, 'r'ight or 'b'ottom
    setSiblingPin: function(sibling, which, offset) {
        if (typeof offset == "undefined") {
            offset = 0;
        }

        this.unsetSiblingPin(which)

        // add me to the new siblings list of pinned
        sibling._addSiblingPinned(this);

        // and ad this panel (and ofset) to my appropriate pinto (_sPin) map
        var pinup = new Minx.PinTo();
        pinup.panel = sibling;
        pinup.off = offset;
        this._sPin[which] = pinup;
    },

    // unpin me from my bro
    // which - 'l'eft, 't'op, 'r'ight or 'b'ottom
    unsetSiblingPin: function(which) {
        if(this._sPin[which] != null) {                               // got a bro im pinned to 
            this._sPin[which].panel._removeSiblingPinned(this);       // so remove me from my bro's pinned sibling list
        }
        this._sPin[which] = null;
    },

    //*** some usefull docking undocking filling sugar

    // just set me freeee from parents and sisters
    unPin: function() {
        this.pinParent({'l': -1, 't': -1, 'r': -1, 'b': -1});
        this.unsetSiblingPin('l');
        this.unsetSiblingPin('t');
        this.unsetSiblingPin('r');
        this.unsetSiblingPin('b');
    },

    // like a greedy spoilt child taking up all that its parent can offer
    fillParent: function(off) {
        if (typeof off == "undefined") {
            off = 0;
        }
        this.unPin();
        this.pinParent({'l': off, 't': off, 'r': off, 'b': off});
    },

    // dock to my parent
    // which - 'l'eft, 't'op, 'r'ight or 'b'um
    dock: function(where, offset) {
        if (typeof offset == "undefined") {
            offset = 0;
        }
        // reset any existing dock
        this.unPin();
        
        var param = {'l': -1, 't': -1, 'r': -1, 'b': -1};
        if(where ==='t' || where ==='b') {
            // pin left and right always - if we are docking bottom
            param.l = offset;
            param.r = offset;
        }
        if(where ==='l' || where ==='r') {
            // pin eft and right always
            param.t = offset;
            param.b = offset;
        }

        // pin top or bottom
        param[where] = offset;

        this.pinParent(param);
    },

    
    // *** consider these kind of 'protected'

    // show() calls render() which calls these two layout(), then draw()
    // override of default laying out to do my parent and sibling pinning geometry
    layout: function() {

        // work out my postion if pinned to my parent
        this._doParentPinning();

        // work out my position if pinned to any of my siblings
        this._doSiblingPinning();

        // if any geometry changed with me then ask any sibling panels pinned to me to lay themselves out as well
        for(var pin in this._pinned) {
            this._pinned[pin].layout();
        }

        // now i have new geometry call the base panel layout
        Minx.PinnedPanel.Super.prototype.layout.call(this);
    },

    // standard panel draw only checks children - but I might need to draw any siblings pinned to me
    draw: function() {
        // any of our style or position changed
        if(this.isDirty()) {
            Minx.PinnedPanel.Super.prototype.draw.call(this);

            // now ask my pinned pals to do the same
            for(var pin in this._pinned) {
                this._pinned[pin].draw();
            }
        }
    },

    // ***** Oooh me privates!

    // add a panel to my pinned sibling lists
    _addSiblingPinned: function(panel) {
        this._pinned[panel.getId()] = panel;    
    },

    // extract this panel from your list of pinned sibling panels
    _removeSiblingPinned: function(panel) {
        delete this._pinned[panel.getId()];
    },

    // layout based on my siblings
    _doSiblingPinning: function() {
        var pd = this.getParent().getNewDims();

        // parent pin
        var pp = this._pPin;
        
        // sibling pin
        var sp = this._sPin;

        // my Geometry
        var nG = this.getNewDims();

        // shorthand for the new dimensions
        var l = nG.l, t = nG.t, w = nG.w, h = nG.h;

        // --- left and right pinning

        // get my left from any pinned
        // parent pin?
        if(pp.l >= 0) {
            l = pp.l;
        }

        // or sibling pin - my left is my siblings left + width and the offset
        if(sp.l != null) {
            var sd = sp.l.panel.getNewDims(); 
            l = sd.l + sd.w + sp.l.off;
        }


        // get my right from any pinned
        var right = l + w;              // temp value of a 'right' coord - used to wor out width

        // inned to my parents right - so my right is my parents left and width minus offset
        if(pp.r >= 0) {
            right = pd.w - pp.r;
        }

        // or sibling pin?? - so my right is my siblings left  minus offset
        if(sp.r != null) {
            var rd = sp.r.panel.getNewDims(); 
            right = sd.l - sp.r.off;
        }

        // get my width = right - left
        w = right - l;


        // --- top and bottom pinning

        // top parent pin?
        if(pp.t >=0 ) {
            t = pp.t;
        }

        // top sibling pin
        if(sp.t != null) {
            var sd = sp.t.panel.getNewDims(); 
            t = sd.t + sd.h + sp.t.off;
        }

        // my new bottom is my new top + height
        var b = t + h;


        // bottom parent pin
        if(pp.b >= 0) {
            b = pd.h - pp.b;
        }


        // bottom sibling pin
        if(sp.b != null) {
            var sd = sp.b.panel.getNewDims(); 
            b = sd.t- sp.b.off;
        }

        h = b - t;

        this.setPos(l, t);
        this.setSize(w, h);

    },


    // TODO - review - this might be redundent the sibling pin function might do all the parent pinning as well 
    // private work out parent pinning
    // update my geometary based on how I am pinned to my parent
    // each parent pin has to be mutully exclusive to sibling pinning
    // pinning to parent is like docking - or stretching
    // dont pin to parent and a sibling
    _doParentPinning: function() {
        var pp = this._pPin;
        // get my parents geometry
        var pG = this.getParent().getNewDims();
        // my Geometry
        var nG = this.getNewDims();
        // the new dimensions
        var l = nG.l, t = nG.t, w = nG.w, h = nG.h;
        
        // pin my left edge to my parent left edge + offset
        if(pp.l >= 0) {
            l = pp.l;
        }

        //pin my right edge to my parents right edge
        if(pp.r >= 0) {
            // pinned left to parent?
            if(pp.l >= 0) {                      // if pinned left as well then my width = my parents width minus offsets
                w = pG.w - pp.l - pp.r;
            }
            else {
                l = pG.w - nG.w - pp.r
            }
        }

        // pin my top edge to my parent top edge + offset
        if(pp.t >= 0) {
            t = pp.t;
        }

        //pin my bottom edge to my parents bottom edge
        if(pp.b >= 0) {

            // pinned to top as well
            if(pp.t >= 0) {   // if pinned top as well then my height = my parents height minus top and bottom offsets
                h = pG.h - pp.t - pp.b;
            }
            else {
                t = pG.h - nG.h - pp.b
            }
        }
        
        this.setPos(l, t);
        this.setSize(w, h);
    }
});

Minx.pm.register('pinned', Minx.PinnedPanel);
