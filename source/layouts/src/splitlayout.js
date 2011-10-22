
//layout namespace

if (typeof Minx.Layout === "undefined") {
    Minx.Layout = {};
}


Minx.Layout.SplitLayout = my.Class({
    // main is simply the containing panel
    constructor: function(main, lnw, pnw) {


        this._navSlideTimer = null;        // clearable timeout so can cancel delayed hides
        this._stuffSlideTimer = null;        // clearable timeout so can cancel delayed hides

        this._hidden = true;
        this._menpop = true;                // true if the menpop button should be shown

        if( typeof lnw == 'undefined') {
            lnw = 300;             // 30% by default - in landscape mode
        }

        if( typeof pnw == 'undefined') {
            pnw = 300;            // 300 px by default
        }

        var whichWay = "";                  // explicit value of whach way this layout thinks it is

        this.setNavLandWidth(lnw);
        this.setNavPortWidth(pnw);


        var me = this;
        var touch = Minx.pm.isTouch();

        // ---   navigation panel
        //this._navPanel = Minx.pm.add(main, 'title-panel');
        this._navPanel = Minx.pm.add(main,'mover-panel');
        this._navPanel.addClass('round-top');
        this._navPanel.addClass('thin-border');
        this._navPanel.addTitle();
        
        this._navPanel.addClass("left-nav");
        this._navPanel.setAnimate(200);


        // make it lighter
        this._navPanel.getTitle().removeClass('dark-bar');
        this._navPanel.getTitle().addClass('light-bar');
        this._navPanel.hide();

        // and give the panel a rouncded bum
        // TODO - check this is already done        this._navPanel.getContentPanel().addClass('round-bottom');

        
        // --- right hand  panel of stuff
        this._stuff = Minx.pm.add(main,'mover-panel');
        this._stuff.addClass('round-top');
        this._stuff.addClass('thin-border');
        this._stuff.addClass('stuff');
        this._stuff.addTitle();
        this._stuff.setAnimate(0);
        this._stuff.hide();


        if(!touch) {
            //dock it right as well
            this._stuff.pinParent({'l': -1, 't': 0, 'r': 0, 'b': 0});
        }

        // add button to pop up the navigation when in portrait
        this._navPopButton = this._stuff.getTitle().addButton('l', 10, 'Menu');
        this._navPopButton.setStyle("z-index", "100");
        
        //TODO Check this and a handler - client should do this
        this._navPopButton.onClick(function(panel,e){

            console.log("===========>navPopButton")
             me._popNavigation();
        });

        this._navPopButton.hide();

        this.hide(true);

        // orientation
        this._isPort = 'doit';
        this.inChange = false;
        this.reOrient(true);            // initial = true so dont do timers and dont call show
        
        // hook into window resize for web apps
        Minx.eq.subscribe(this, window, 'resize', '_resizeEvent');

        Minx.eq.subscribe(this, window, 'orientationchange', '_resizeEvent');
    },


    _resizeEvent: function(e) {

        if(!this.inChange) {
            this.inChange = true;
            Minx.pm.calcDims();
            this.reOrient(false);           // true ro draw it all
            this.inChange = false;
        }        
    },


    embelish: function(opts, handler) {
        var panel = opts.panel;
        var level = opts.level;
        var content = opts.forcontent || false;
        // make room for the menu button - only needed in portrait really 
        if (content) {

            panel.setTitleInvisible(0);;
        }
        else {

            if (level > 1) {

                // we manage the transitioning between menus so we add our own back button
                var backButton = panel.getTitle().addButton();
                backButton.setType('back');
                backButton.pinParent({l: 25, t:7, r:-1, b:-1});
                
                backButton.show();   

                backButton.onClick(handler);
                
                return backButton;
            }
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


    getMainPanel: function() {
        return this._stuff;
    },


    getNavPanel: function() {
        return this._navPanel;  
    },


    // set nav width in landscape - only takes effect on next orientation change
    setNavLandWidth: function(width) {
        this._navLandWidth = width;          // nav width in landscape
        if(this._navLandWidth < 1) {        // then it is a ratio
            this._navLandWidth = Minx.pm.dims.lw * this._navLandWidth;
        }
    },


    // set nav width in portrait - only takes effect on next orientation change
    setNavPortWidth: function(width) {
        this._navPortWidth = width;            // nav width in portrait
        if(this._navPortWidth < 1) {        // then it is a ratio
            this._navPortWidth = Minx.pm.dims.pw * this._navPortWidth;
        }
    },


    show: function() {
        this._hidden = false;
        
        this._navPanel.layout(true);
        
        if(!this._isPort) {

            this._navPanel.show();  //ddd
        }
        
        this._stuff.show();


    },


    hide: function(now) {
        this._hidden = true;
        this._navPanel.hide({now: now});
        this._stuff.hide({now: now});
    },


/*  TODO - delete ? and it _hidden used
    showMain: function() {
        if(this._hidden) {
            this._stuff.render(now);
        }
        else {
            this._stuff.show();
        }
    },
*/

    setMainPanelContent: function(panel, how, hideMenPop) {
        var me = this;
        if (hideMenPop) {

            this._navPopButton.setAnimate(200);
            this._navPopButton.hide(); 
            this._menpop = false;
        }
        else {

            this._menpop = true;
            
            if(this.whichWay == 'p') {

                setTimeout(function() {

                    me._navPopButton.setAnimate(200);
                    me._navPopButton.show({fade: true}); 
                }, 200)
            }
        }

        this._stuff.setActivePanel(panel, how, true);
    },


    setMenuPanel: function(panel, how) {
        
        this._navPanel.setActivePanel(panel, how, true);
    },




    // called when a navigation action has occured
    navAction: function() {
        // if we are in portrait then make sure we hide the nav panel
        if( this.whichWay == "p") {
            this._navPanel.hide();
        }
    },


    _setLandscape: function(initial) {
        var me = this;
        var nw = Minx.pm.dims.w;
        var nh = Minx.pm.dims.h;
        var touch = Minx.pm.isTouch();

        this.whichWay = "l";

        window.scrollTo(0, 0);


/* Hiding code - if still want this functionality - the get content of active panel

        this._stuff.getContentPanel().setAnimate(100);
        this._stuff.getContentPanel().hide();
        this._stuff.getContentPanel().render();
        this._stuff.getContentPanel().setAnimate(200);        
*/


        this._stuff.unPin();

        // pin it to the nav panel
        this._stuff.setSiblingPin(this._navPanel, 'l');

        this._navPanel.unPin();
        if(this._hidden) {
            this._navPanel.render();        // IMPORTANT not to show as this can unhide it
        }
        else {
            this._navPanel.show();
        }


        if(!touch) {
            // set the nav panel to docked in width    
            // and dock it left
            me._navPanel.pinParent({'l': 0, 't': 0, 'r': -1, 'b': 0});
            
        }
        
        setTimeout(function() {
            me._stuff.setSize(nw - me._navLandWidth, nh);        

            me._stuff.addClass('thin-border');
            
/* Hiding code - if still want this functionality - the get content of active panel

            me._stuff.getContentPanel().setAnimate(200); 
            me._stuff.getContentPanel().show();
*/            
            
            if(me._hidden) {
                me._stuff.render();        // IMPORTANT not to show as this can unhide it
            }
            else {
                me._stuff.show();
            }
             
        }, 300);

        me._navPanel.setSize(me._navLandWidth, nh);

        me._navPanel.setPos(0, 0);

        // TODO: handle me in the panel manager
        me._navPanel.setStyle('z-index', '1');

        // stop it being rendered like a popup
        me._navPanel.removeClass('pop-up');
        

        // want to lay it all out and dump it onscreen with no geometry animation
        if(!initial) {
            me._navPanel.render();

            me._stuff.render();    
        }

        // have to hide instantly else it can finish the hide transition after the show
        me._navPopButton.hide({now:true}); // instant = true

    },

    _setPortrait: function(initial) {
        var me = this;

        // need to know current width to slide left that much
        var navp = this._navPanel.getDims();

        var nw = Minx.pm.dims.w;
        var nh = Minx.pm.dims.h;
        
        var touch = Minx.pm.isTouch();

        var startTime = undefined;
        var time = undefined;
        var startPos = 0;

        this.whichWay = "p";
        

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

        // slide the nav panel out to left
        this._navPanel.unsetParentPin('l');

        
        // just show it if its the first time
        if (initial) {
            
            this._stuff.unPin();
            this._stuff.setPos(0,0);
            this._stuff.setSize(nw, nh);            

            // this._stuff.getContentPanel().show();
            

            if(this._hidden) {
                me._stuff.render();        // IMPORTANT not to show as this can unhide it
            }
            else {
                me._stuff.show();
            }
            
            

            me._navPanel.setPos((0 - this._navLandWidth) - 1 , 0);
            me._navPanel.render();
            

        } else {

            // try unsetting borders
            this._navPanel.removeClass('thin-border');
            this._stuff.removeClass('thin-border');


/* Hiding code - if still want this functionality - the get content of active panel
            this._stuff.getContentPanel().setAnimate(100);
            this._stuff.getContentPanel().hide();
            this._stuff.getContentPanel().render();
            this._stuff.getContentPanel().setAnimate(200);
*/

            this._stuff.setSize(nw, nh);
            this._stuff.render();


            if(!touch) {
                
                me._navPanel.setPos((0 - this._navLandWidth) - 1 , 0);
                me._navPanel.render();
            }
            else {



                setTimeout(function() {
                //    window.scrollTo(0, 0);    
                    startPos = window.scrollX;
                    startTime = Date.now();
                    
                    (function animloop(){
                        if(render()) {
                          requestAnimFrame(animloop);
                        }
                    })();

                }, 90);

              
                // 390  400 and 1.5 - for 300 

                setTimeout(function() {
                    me._navPanel.setPos((0 - me._navLandWidth) - 1 , 0);
                    me._navPanel.render();


                }, 100);

            }

/* Hiding code - if still want this functionality - the get content of active panel

            setTimeout(function() {
                        me._stuff.getContentPanel().setAnimate(200);
                        me._stuff.getContentPanel().show();
                        
                }, 300);
*/
        }

        console.log("showing the nav Popup button");
        if (me._menpop) {
            me._navPopButton.show({fade: true}); 
        }
        
    },

    // in portrait the nav pops up
    _popNavigation: function() {

        var left = this._navPanel.getDims().l;
        
        if(left < 0) {
            this._navPanel.hide();
        }

        // set hidden or offscreen
        if(this._navPanel.isHidden() || left < 0) {

            
            // un pin main from the nav panel
            this._stuff.unsetSiblingPin('l');
            
            // set a popup size
            this._navPanel.setSize(this._navPortWidth, 600);

            // unpin it
            this._navPanel.unPin();

            // repin it with offsets
            this._navPanel.setPos(20, 50);
            

            // force it on top - but this will be managed by the panel manger eventually
            this._navPanel.setStyle('z-index', '10');

            // give it the pop-up style
            this._navPanel.addClass('pop-up');
            
            // fade only animation - on pop
            this._navPanel.addClass('anim-fade-only');
            this._navPanel.removeClass('anim-geom');                // TODO - use setAnim instead
            
            // does this move it into place 
            this._navPanel.render();

            // boom!
            this._navPanel.show();

            // slide animation back
            this._navPanel.removeClass('anim-fade-only');
            this._navPanel.addClass('anim-geom');                   // TODO - use setAnim instead
        }
        else {
            this._navPanel.hide();
        }
    }
});