
//layout namespace

if (typeof Minx.Layout === "undefined") {
    Minx.Layout = {};
}



Minx.Layout.PhoneLayout = my.Class({

    constructor: function(main) {
        this._navSlideTimer = null;        // clearable timeout so can cancel delayed hides
        this._stuffSlideTimer = null;        // clearable timeout so can cancel delayed hides
        

        var me = this;
        //var touch = Minx.pm.isTouch();

        // ---   navigation panel

        this._navPanel = Minx.pm.add(main,'mover-panel');
        this._navPanel.addClass('round-top');
        this._navPanel.addClass('thin-border');
        this._navPanel.addClass('left-nav');
        this._navPanel.addTitle();
        

        // this._navPanel = Minx.pm.add(main,'title-panel');
        this._navPanel.setAnimate(200);
        

        // make it lighter
        this._navPanel.getTitle().removeClass('dark-bar');
        this._navPanel.getTitle().addClass('light-bar');

        
        // --- right hand  panel of stuff
        this._activeMain = null;                // the panel that is in the active "main" manel
        
        // orientation
        this._isPort = 'doit';
        this.inChange = false;
        
        // this.reOrient(true);            // initial = true so dont do timers and dont call show
        
        // hook into window resize 
        Minx.eq.subscribe(this, window, 'resize', '_resizeEvent');
    },


    _resizeEvent: function(e) {

        if(!this.inChange) {
            this.inChange = true;
            //Minx.pm.calcDims();
            //this.reOrient(false);           // true ro draw it all
            this.inChange = false;
        }
    },

    
    embelish: function(opts, handler) {
        var panel = opts.panel;
        var level = opts.level;
        if (level > 1) {
            // we manage the transitioning between menus so we add our own back button
            var backButton = panel.getTitle().addButton();
            backButton.setType('back');
            backButton.pinParent({l: 10, t:7, r:-1, b:-1});
            
            backButton.show();   

            backButton.onClick(handler);
            
            return backButton;
        }
        
    },


    reOrient: function(initial) {
        
        var nisPort = (Minx.pm.dims.or === 'p');

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

    
    setMainPanelContent: function(panel, how) {
        this._activeMain = panel;
        this._navPanel.setActivePanel(panel, how);
    },


    setMenuPanel: function(panel, how) {
        
        this._navPanel.setActivePanel(panel, how);
    },


    // called when a navigation action has occured
    navAction: function() {
        // phone layout does nowt
    },


    getMainPanel: function() {
        return this._navPanel;
    },


    getNavPanel: function() {
        return this._navPanel;  
    },


    show: function() {
        this._navPanel.show();
    },


    hide: function() {
        this._navPanel.hide();
    },


    _setLandscape: function(initial) {
        ffff
        var me = this;
        var nw = Minx.pm.dims.w;
        var nh = Minx.pm.dims.h;
        
        window.scrollTo(0, 0);
        
        this._navPanel.setSize(nw, nh);
        
        this._navPanel.render();        
    },


    _setPortrait: function(initial) {
        var me = this;

        // need to know current width to slide left that much
        var navp = this._navPanel.getDims();

        var nw = Minx.pm.dims.w;
        var nh = Minx.pm.dims.h;
        
        
        var startTime = undefined;
        var time = undefined;
        var startPos = 0;
        

        function render(time) {
          time = Date.now();
          // time difference in 10ths of secconds - divide by 10 - one second - divide by 2 (as below) = (10/2) 10ths of a second or half a second
          var npos = startPos - (time - startTime)/1.5;

          if(npos < 0) {
              npos = 0;
          }
          
          window.scrollTo(npos, 0);

          return npos > 0;
        }


        me._navPanel.setSize(nw, nh);

        this._navPanel.render();


        setTimeout(function() {
      
            startPos = window.scrollX;
            startTime = Date.now();
            
            (function animloop(){
                if(render()) {
                  requestAnimFrame(animloop);
                }
            })();

        }, 90);
    },
});

