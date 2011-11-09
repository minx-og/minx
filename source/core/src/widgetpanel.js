(function() { 
"use strict";
/*
DataBoundPanel - registered as data-bound-panel
===============================================

This is a pinned panel with its own little message queue - that any contained widgets should hook into
these are basically when the geometry has changed

One of these should be inhetited for your widget
*/

Minx.DataBoundPanel = my.Class(Minx.PinnedPanel, {

    constructor: function(parent, id) {
    	// call my base constructor
        Minx.DataBoundPanel.Super.call(this, parent, id);
		
		this._model = null;			 // some object containing the data that the view wants

		this._view = null;			 // some object that knows how to draw the model 

		// the resize event handler for my widget code to hook into
		this._resizeCallback = null;

		this.fillParent();			// default fill my mum - eeeeew

    },

    // tell me what my model is - its upto the widget to know what to do with this
    setModel: function(model) {
    	this._model = model;	
    },

    setView: function(view) {
    	this._view = view;	
    },

    getModel: function() {
    	return this._model;
    },

    getView: function() {
    	return this._view;
    },

    // hook into any resize events from the parent panel
    onResize: function(callback) {
    	this._resizeCallback = callback;
    },

    // called if my panels dimaensions have changed 
    resized: function() {
    	if(this._resizeCallback != null) {
	        this._resizeCallback
	    }
    },

    // munge my model into my view - called manually be the client  - could add an 'auto' mode that looked for changes in the model
    // this is what something like the backbone widget wrapper does 
    munge: function() {

        // call functions that i as widget designer know about my model

        // call functions on the view that I a widget designer know about
    },

    // private override to decide what html element my node will be
    getMyElement: function() {
        return 'div';
    },

});

// register for the panelmanager factory
Minx.pm.register('data-bound-panel', Minx.DataBoundPanel);

})();