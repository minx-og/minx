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
        // call super
        Minx.Popup.Super.call(this, parent, id);

        this._centre = true;            // centred by default

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


    // override to hide first - so it fades
    removeMe: function() {

        this.hide();
        // wait animation time to trash it
        var me = this;
        
        setTimeout(function() {
        
           Minx.Popup.Super.prototype.removeMe.call(me);
        
        }, this._animate);
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


    