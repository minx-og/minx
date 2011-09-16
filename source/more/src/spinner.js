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

        this._spinner = null;

    },


    // replace popups onCreation entirely 
    _onCreation: function() {
        
        this._textDiv = null;

        this.setText("Refreshing...");

        this.setAnimate(300);
        this.hide({now:true});            // hide instantly
        
        this.setSize(160, 120);
        this._reCentre();

    },


    show: function(color) {

        Minx.SpinnerPopup.Super.prototype.show.call(this);

        var opts = {
            lines: 13, // The number of lines to draw
            length: 7, // The length of each line
            width: 4, // The line thickness
            radius: 12, // The radius of the inner circle
            color: color || '#DDE', // #rbg or #rrggbb
            speed: 1, // Rounds per second
            trail: 100, // Afterglow percentage
            shadow: false // Whether to render a shadow
        };

        if (this._spinner == null) {
            
            // force correct dimensions
            var dims = this.getNewDims();
            
            this._spinner = new Spinner(opts).spin(this.getNode(), dims.w, dims.h);

        } else {

            this._spinner.spin(this.getNode());
        }
    },


    hide: function(opts) {

        if (this._spinner) {

            this._spinner.stop();
        }

        Minx.SpinnerPopup.Super.prototype.hide.call(this, opts);
    },


    setText: function(text) {

        if (this._textDiv != null) {

            this.getNode().removeChild(this._textDiv);
        }

        var textDiv = document.createElement('div');
        textDiv.setAttribute('class','spinner-text');
        var tn = document.createTextNode(text);
        textDiv.appendChild(tn);
        this.getNode().appendChild(textDiv);

        this._textDiv = textDiv;

    },


});

// register
Minx.pm.register('spinner-pop-up', Minx.SpinnerPopup);
