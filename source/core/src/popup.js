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
        // check that my parent is the main panel
        if(parent.getId() != 'pn0') {
            throw 'popup parent should be the main panel, use "main" as parent Minx.add()- pn0 with -' +  id;
        }

        // call super
        Minx.Popup.Super.call(this, parent, id);

        // add custom class
        this.addClass('pop-up');
        this.addClass('anim-fade-only');
    },

    _onCreation: function() {
        //dont call base
        // default size
        this.setAnimated(false);
        this.hide(true);            // hide instantly
        
        this.setSize(300, 200);
        this._centre = true;            // centred by default
        this._reCentre();
    },

    // if a specific position is set then unpin from the centre
    setPos: function(left, top) {
        this._centre = false;
        Minx.PinnedPanel.Super.prototype.setPos.call(this, left, top);
    },

    // re-pin to the centre - (should probably render again)
    setCentred: function() {
        this._centre = true;
    },

    // override layout to check if we should re-centre
    layout: function() {

        if(this._centre) {
            this._reCentre();
        }

        // now call the base panel layout - we shouldn't have pinning but we could i suppose
        Minx.PinnedPanel.Super.prototype.layout.call(this);
    },

    // private - center to the viewport - should make these dimensions available in the panel manager
    _reCentre: function(){

        var dw = document.documentElement.clientWidth;
        var dh = document.documentElement.clientHeight;

        // use the new unaplied dimensions
        var d = this.getNewDims();

        // call the base setPos directly
        Minx.PinnedPanel.Super.prototype.setPos.call(this, (dw - d.w) / 2, (dh - d.h) / 2);
    },

    // should be private - return my element type
    getMyElement: function() {
        return 'div';
    },
});

Minx.pm.register('pop-up', Minx.Popup);


    