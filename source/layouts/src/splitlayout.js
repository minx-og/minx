
//layout namespace

if (typeof Minx.Layout === "undefined") {
    Minx.Layout = {};
}

Minx.Layout.SplitLayout = my.Class({

    constructor: function(main) {
        this._navSlideTimer = null;        // clearable timeout so can cancel delayed hides
        this._stuffSlideTimer = null;        // clearable timeout so can cancel delayed hides
        this._navLandWidth = 300;             // 30% by default - in landscape mode
        this._navPortWidth = 300;            // 300 px by default

        var me = this;

        // ---   navigation panel
        this._navPanel = Minx.pm.add(main,'title-panel');

        // dock it right
        this._navPanel.pinParent({'l': 0, 't': 0, 'r': -1, 'b': 5});

        // make it lighter
        this._navPanel.getTitle().removeClass('dark-bar');
        this._navPanel.getTitle().addClass('light-bar');

        // and give the panel a rouncded bum
        this._navPanel.getContentPanel().addClass('round-bottom');

        // add a back button
        this._navBackButton = this._navPanel.getTitle().addButton('l', 10);
        this._navBackButton.setType('back');
        // client must setText
        
        // navigation back button handler
        this._navBackButton.onClick(function(panel,e){
            alert("I got a nav click on " + panel.getId());
        });


        // --- right hand  panel of stuff
        this._stuff = Minx.pm.add(main,'title-panel');

        // pin it to the nav panel
        this._stuff.setSiblingPin(this._navPanel, 'l');

        //dock it right as well
        this._stuff.pinParent({'l': -1, 't': 0, 'r': 0, 'b': 0});
        
        // add button to pop up the navigation when in portrait
        this._navPopButton = this._stuff.getTitle().addButton('l', 10, 'Menu');
        
        //TODO and a handler - client should do this
        this._navPopButton.onClick(function(panel,e){
            me._popNavigation();
        });

        // orientation
        this._isPort = 'doit';
        this.reOrient(true);            // initial = true so dont do timers and dont call show
        
        // hook into window resize 
        Minx.eq.subscribe(this, window, 'resize', '_resizeEvent');

    },

    _resizeEvent: function(e) {

        this.reOrient(false);           // true ro draw it all
    },

    reOrient: function(initial) {
        var nw = document.documentElement.clientWidth;
        var nh = document.documentElement.clientHeight

        var nisPort = nw < nh;

        // if is portrait and is a percentage the redraw it anyway
        if(!nisPort) {
            var navWidth = this._navLandWidth;
            if(this._navLandWidth < 1) {        // then it is a ratio
                navWidth = nw * this._navLandWidth;
                // set the nav panel to docked in width    
                this._navPanel.setSize(navWidth, 0);
            }
        }

        // orientation changed
        if(nisPort !== this._isPort){
            this._isPort = nisPort;
            if(nisPort) {
                this._setPortrait(initial);
            }
            else {
                this._setLandscape(initial);
            }
        }
    },

    getMainPanel: function() {
        return this._stuff;
    },

    getNavPanel: function() {
        return this._navPanel;  
    },

    // set nav width in landscape - only takes effect on next orientation change
    setNavLandWidth: function(width) {
        this._navLandWidth = width;          // nav width in landscape
    },

    // set nav width in portrait - only takes effect on next orientation change
    setNavPortWidth: function(width) {
        this._navPortWidth = width;            // nav width in portrait
    },

    _setLandscape: function(initial) {
        var me = this;
        var nw = document.documentElement.clientWidth;

        var navWidth = this._navLandWidth;
        if(this._navLandWidth < 1) {        // then it is a ratio
            navWidth = nw * this._navLandWidth;
        }

        // set the nav panel to docked in width    
        this._navPanel.setSize(navWidth, 0);

        // show it offscreen so it can slide back on
        if(!initial) {
            this._navPanel.show();
        }

        // and dock it left
        this._navPanel.pinParent({'l': 0, 't': 0, 'r': -1, 'b': 0});

        // TODO: handle this in the panel manager
        this._navPanel.setStyle('z-index', '1');

        // stop it being rendered like a popup
        this._navPanel.removeClass('pop-up');

        // unpin it from the left edge...
        me._stuff.unsetParentPin('l');

        //... and pin the stuff panel left to the nav panel
        me._stuff.setSiblingPin(me._navPanel, 'l');
        
        // hide the left main stuff panel nav pop button
        // have to hide instantly else it can finish the hide transition after the show
        me._navPopButton.hide(true);

        // show it again so it can slide back on
        if(!initial) {
            this._navPanel.show();
        }
        
    },

    _setPortrait: function(initial) {
        var me = this;

        // need to know current width to slide left that much
        var navp = this._navPanel.getDims()

        // make the stuff panel fill the screen
        this._stuff.unPin();
        this._stuff.fillParent();
        
        // slide the nav panel out to left
        this._navPanel.unsetParentPin('l');
        this._navPanel.setPos(0 - navp.w - 1 , 0);
        
        // only show stuff if from an orientation and not the constructor
        if(!initial) {
            // show the nav panel
            this._navPanel.show();
        
            // show the top left nav pop button
            this._navPopButton.show();

            // show my new layout    
            this._stuff.show();
        }
    },

    _getPortraitNavWidth: function() {
        var navWidth = this._navPortWidth;
        var nw = document.documentElement.clientWidth;

        if(this._navPortWidth < 1) {        // then it is a ratio
            navWidth = nw * this._navPortWidth;
        }
        
        return navWidth;    
    },

    // in portrait the nav pops up
    _popNavigation: function() {

        var left = this._navPanel.getDims().l;
        
        if(left < 0) {
            this._navPanel.hide();
        }

        // set hidden or offscreen
        if(this._navPanel.isHidden() || left < 0) {

            var navWidth = this._getPortraitNavWidth();
            
            // set a popup size
            this._navPanel.setSize(navWidth,600);

            // unpin it
            this._navPanel.unPin();

            // repin it with offsets
            this._navPanel.setParentPin('l', 20);
            this._navPanel.setParentPin('t', 50);

            // force it on top - but this will be managed by the panel manger eventually
            this._navPanel.setStyle('z-index', '10');

            // give it the pop-up style
            this._navPanel.addClass('pop-up');

            
            // fade only animation - on pop
            this._navPanel.addClass('anim-fade-only');
            this._navPanel.removeClass('anim-geom');
            
            // does this move it into place 
            this._navPanel.render();

            // boom!
            this._navPanel.show();

            // slide animation back
            this._navPanel.removeClass('anim-fade-only');
            this._navPanel.addClass('anim-geom');
        }
        else {
            this._navPanel.hide();
        }
    }
});