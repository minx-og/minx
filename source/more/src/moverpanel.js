/*
MoverPanel - registered as mover-panel
======================================

This is a pinned panel with the ability to animate its child panels with certain transitions

*/

Minx.MoverPanel = my.Class(Minx.PinnedPanel, {

    constructor: function(parent, id) {
        // call my base constructor
        Minx.MoverPanel.Super.call(this, parent, id);

        // by default fillparent
        this.fillParent();

        this._active = null;

        this._moverAnimate = 300;       // default mover animation speed
    },


    // hook into all my kids being added by defualt first kid added is the active one
    _addKid: function(panel) {
        Minx.MoverPanel.Super.prototype._addKid.call(this, panel);

        if(this._active == null) { // no active panel yet so use this one and keep defaults
            this._active = panel
        }
        else {
            // got our active panel allready so hide all others - consider removing from DOM?
            panel.hide(true, false);            // true = instant, false = detache
        }

        panel.setAnimate(this._moverAnimate);
    },

    
    getActivePanel: function() {
        return this._active;
    },


    // one would expect this panel to be a child of the mover panel - but we are not checking odd things would happen if it was not a child
    setActivePanel: function(panel, transition) {

        if(transition == 'slide-left') {
            
            // unhook both panels from anything
            panel.unPin();
            this._active.unPin();

            // set it to the same dimensions as the active panel
            var parDims = this.getParent().getNewDims();

            panel.setSize(parDims.w, parDims.h);

            // left pin it to the active panel and parent top
            panel.setSiblingPin(this._active, 'l');

            panel.setParentPin('t');

            // put the new panel in its new position without animation
            panel.setAnimate(0);
            // unhide the new panel - in its new off screnn position
            panel.show();

            // reanimate it
            panel.setAnimate(this._moverAnimate);

            var me = this;
            setTimeout(function() {

                // set the active panel position to be 0 - its width - sliding it off the left
                me._active.setPos(0-parDims.w, 0);

                // then show the old panel in its new position off div - which pulls the left pinned new panel in
                me._active.show();    

                // set the new panel as active
                me._active = panel;

                //and make sure it is fully pinned to momma s it resizes on next resize
                me._active.fillParent();    

            }, 0);  //delay zero trick to let dom fully redraw

        }

        
    },
    
    // private override to decide what html element my node will be
    getMyElement: function() {
        return 'div';
    },

});

// register for the panelmanager factory
Minx.pm.register('mover-panel', Minx.MoverPanel);


    