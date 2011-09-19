/*

Popup - registered as pop-up
============================
popup box - keeps central to main. This is a pinned panel realy because of the design flaw that only pinned panels can have things pinned to them

derived classes
---------------
* InputPopup - that has a content panel and a bottom bar for buttons

*/

Minx.Popup = my.Class(Minx.PinnedPanel, {

    constructor: function(parent, id) {

        this._centre = true;            // centred by default
        // call super
        Minx.Popup.Super.call(this, parent, id);

        // add custom class
        this.addClass('anim-fade-only');
    },


    _onCreation: function() {
        //dont call base
    
        // default size
        this.setAnimate(300);
        this.hide({now:true});            // hide instantly
        
        this.setSize(300, 200);
        this._reCentre();
    },

    
    // if a specific position is set then unpin from the centre
    setPos: function(left, top) {

        if (this._centre == false) {

            Minx.Popup.Super.prototype.setPos.call(this, left, top);
        }
        else {

            console.log("Warning - Setting a position on a centred panel");
        }
    },


    // re-pin to the centre - (should probably render again)
    setCentred: function(centred) {

        if (typeof centred === "undefined") {

            centred = true;
        }
        
        this._centre = centred;
    },


    // override to hide first - so it fades
    removeMe: function() {

        this.hide();
        // wait animation time to trash it
        var me = this;
        
        setTimeout(function() {
        
           Minx.Popup.Super.prototype.removeMe.call(me);
        
        }, this._animate);
    },


    // override layout to check if we should re-centre
    layout: function(force) {

        if(this._centre) {

            this._reCentre();
        }

        // now call the base panel layout - we shouldn't have pinning but we could i suppose
        Minx.Popup.Super.prototype.layout.call(this, force);
    },


    show: function() {
        // override to allow initial animation
        this._instantFirstDraw = false;
        Minx.Popup.Super.prototype.show.call(this);
    },


    // private - center to the viewport - should make these dimensions available in the panel manager
    _reCentre: function(){

        var parDim = this.getParent().getNewDims();
        var dw = parDim.w; //document.documentElement.clientWidth;
        var dh = parDim.h; //document.documentElement.clientHeight;

        // use the new unaplied dimensions
        var d = this.getNewDims();

        // call the base setPos directly
        this._newG.l = (dw - d.w) / 2;
        this._newG.t = (dh - d.h) / 2;
    },


    getClassName: function() {
        return 'pop-up';
    },
    
    // should be private - return my element type
    getMyElement: function() {
        return 'div';
    },
});


Minx.pm.register('pop-up', Minx.Popup);


    