/*

BottomBar registered as bottom-bar
==================================
Simply a bar that pins itself to the botom of its parent

witha little helper to add a pinned button

*/

Minx.ToolBar = my.Class(Minx.PinnedPanel, {

    constructor: function(parent, id) {
        // call base constructor
        Minx.ToolBar.Super.call(this, parent, id);

        this.addClass('dark-bar');
    },

    // with animation set the bar gets transitioned down from the top - looks odd
    // but then on resize the panel lags the title
    _onCreation: function() {
        //dont call base
        // this.setAnimate(0);
        this.setSize(0,45);
    },

    // doc to my parent where = 't' for top or 'b' for bollocks?
    dock: function(where, offset) {
        // do the dock man
        Minx.ToolBar.Super.prototype.dock.call(this, where);

        // clear some inappropriate prettyness 
        this.removeClass('bottom-bar');
        this.removeClass('top-bar');

        // add  some inappropriate prettyness 
        var cl = 'top'
        
        if(where == 'b') {
            cl = 'bottom';
        }

        this.addClass(cl + '-bar');
        if(!Minx.pm.dims.phone) {
            this.addClass('round-' + cl);
        }
        
    },


    // addButton - where = pin position, off = offset
    //   whats a toolbar without buttons, just a bar really 
    addButton: function(where, off, text) {
        if (typeof text === "undefined") {
            text = 'Button';
        }

        var but = Minx.pm.add(this,'button');
        but.setPos(0, 7)
        but.setParentPin(where, off);
        but.setText(text);
        return but;  
    },

    // override for dom element type
    getMyElement: function() {
        return 'div';
    },
});

Minx.pm.register('tool-bar', Minx.ToolBar);


    