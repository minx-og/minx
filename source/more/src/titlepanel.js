/*
TitlePanel - registered as title-panel
======================================

This is a pinned panel with a title-bar and a main content area pinned below the title bar

*/

Minx.TitlePanel = my.Class(Minx.PinnedPanel, {

    constructor: function(parent, id) {
        // call my base constructor
        Minx.TitlePanel.Super.call(this, parent, id);


        // add a title-bar
        this._titleBar = Minx.pm.add(this,'tool-bar');
        this._titleBar.dock('t');


        // add a plain pinned panel
        this._mainPanel = Minx.pm.add(this,'pinned');

        // and round the bottom off - in case asked to pop up
        this._mainPanel.addClass('round-bottom');
        //this._mainPanel.setAnimate(false);

    
        this.addClass('thin-border');
        
        // pin the main panel to bottom of title bar
        this._mainPanel.setSiblingPin(this._titleBar, 't', 0);  	// 1 pixel offset for bottom border

        // now pin the rest to left, reeight, bottom
        this._mainPanel.setParentPin('l', 0);
        this._mainPanel.setParentPin('r', 0);
        this._mainPanel.setParentPin('b', 0);

    },

    // getTitle - so that clients know where to add buttons
    getTitle: function() {
    	return this._titleBar;
    },

    // the main content so clients can draw in it
    getContentPanel: function() {
        return this._mainPanel;
    },

    // title-panel styles, and a thin border
    getClassName: function() {
        return 'title-panel';
    },
        // private override to decide what html element my node will be
    getMyElement: function() {
        return 'div';
    },

});

// register for the panelmanager factory
Minx.pm.register('title-panel', Minx.TitlePanel);


    