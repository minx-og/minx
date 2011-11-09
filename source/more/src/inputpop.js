(function() { 
"use strict";
/*
InputPopup registered as input-pop-up
=====================================
popup box that has a cntent panel and a 
has a button bar along the bottom, the foot bar - for clients to put buttons in
*/

Minx.InputPopup = my.Class(Minx.Popup, {

    constructor: function(parent, id) {
        // call super
        Minx.InputPopup.Super.call(this, parent, id);

        // the main content panel - for fields etc
        this._mainPanel = Minx.pm.add(this,'pinned');
        this._mainPanel.addClass('round-top');
        this._mainPanel.setAnimate(0);                      // dont want the content animating - it stays pinned


        // the footBar - pins itself to the bottom of things - can add buttons in this
        this._footBar = Minx.pm.add(this,'tool-bar');
        // dock it to the botom
        this._footBar.dock('b');

        // now pin the content  to left, right, bottom - to top of footbar - with padding for the rounded corners
        this._mainPanel.setParentPin('l', 5);
        this._mainPanel.setParentPin('r', 5);
        this._mainPanel.setParentPin('t', 5);
        // pin bottom to top of title bar
        this._mainPanel.setSiblingPin(this._footBar, 'b', 5);      // 1 pixel offset for bottom border


        Minx.eq.subscribe(this, this.getNode(), 'keypress');    // register for keypresses

        this._defaultButton = null;                             // send enter presses to this button

    },


    eventParse: function(event) {

        var thing = {id: this._defaultButton.getId(), e: event};

        // pass event to default button - dont check for type as only one registered at the moment - review if more subscribes
        this._defaultButton.eventFired(event);

        return thing;
    },


    setDefault: function(panel) {

        this._defaultButton = panel;
        // tell this panel to draw and 'default' class stuff 
        panel.addClass("default");
    },


    getMainPanel: function() {

        return this._mainPanel;  
    },


    //getFootBar - for clients to add buttons.
    getFootBar: function() {

        return this._footBar;
    },


    getMyElement: function() {
        
        return 'form';
    },

});

// register
Minx.pm.register('input-pop-up', Minx.InputPopup);


})();
