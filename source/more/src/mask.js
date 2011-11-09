(function() { 
"use strict";

/*
InputPopup registered as input-pop-up
=====================================
popup box that has a cntent panel and a 
has a button bar along the bottom, the foot bar - for clients to put buttons in
*/

Minx.MaskPanel = my.Class(Minx.PinnedPanel, {

    constructor: function(parent, id) {
        // call super
        Minx.MaskPanel.Super.call(this, parent, id);

        this.fillParent();
        this.addClass('mask');
        this.setStyle('z-index', '45');
        this._instantFirstDraw = false;
        this.hide({now: true});

        this.setAnimate(500);
        
    }
});

// register
Minx.pm.register('mask', Minx.MaskPanel);

})();
