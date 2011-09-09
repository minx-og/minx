/*
InputPopup registered as input-pop-up
=====================================
popup box that has a cntent panel and a 
has a button bar along the bottom, the foot bar - for clients to put buttons in
*/

Minx.SpinnerPopup = my.Class(Minx.Popup, {

    constructor: function(parent, id) {
        // call super
        Minx.SpinnerPopup.Super.call(this, parent, id);

        this.addClass("spinner");

        this.setMaxOpacity('0.4');
    },


    // replace popups onCreation entirely 
    _onCreation: function() {

        this.setText("Refreshing...");

        this.setAnimate(300);
        this.hide({now:true});            // hide instantly
        
        this.setSize(250, 180);
        this._reCentre();
    },

    
    setText: function(text) {
        var tn = document.createTextNode(text);
        this.getNode().appendChild(tn);
    },


});

// register
Minx.pm.register('spinner-pop-up', Minx.SpinnerPopup);
