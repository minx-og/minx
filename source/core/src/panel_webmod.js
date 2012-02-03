(function() { 
"use strict";

/* 
Minx.Panel Modifier 
===================

core class - all derived from this (not layouts)

some code could be written in shorthand forms - but I have sacrificed brevity for readability 
- all to often clever syntax just serves to confuse, and for little or no performnce gain 


*/


// These litle classes are used to provide the markup for animations
// they are substituted for the functions...
// _setXY ==> setpos
// _setTime ==> settime

// these atre set up once at load time so no constant agent checking - there is no code to do the agent checking yet...


// Webkit accelerated animations


if ($.browser.webkit) {

    Minx.anim = {
        trans: '-webkit-transform',
        transpeed: '-webkit-transition-duration',

        getTranslate: function(x, y) {
            return 'translate3d(' + x + 'px,' + y + 'px, 0px)';
        },


        setpos: function(pan, x, y) {
//        if (pan._animate  > 0) {
            pan.setStyle(Minx.anim.trans, this.getTranslate(x, y));
        
                    /* use this event if we add animations
            pan.getNode().addEventListener( 'webkitAnimationEnd', function( event ) {
                console.log("anim finished " + event);
            } );
            */

            // Experimentally setting the pixed positions after the transitions have finished so phones detect the field positions properly
            //     pan.getNode().addEventListener( 'webkitTransitionEnd', function( event ) {
                    
            //         pan.getNode().removeEventListener( 'webkitTransitionEnd', this);   // this is this function i hope

            //         Minx.anim.fixpos(pan, x, y);

            //     } );
            // }
            // else {
            //     Minx.anim.fixpos(pan, x, y);            
            // }
        },
       //uncomment this if using the end transition event listenercall above  
/*
        fixpos: function(pan, x, y) {
            pan.removeStyle(Minx.anim.trans);
            pan.removeStyle(Minx.anim.transpeed);

            pan.setStyle('left', x + 'px');
            pan.setStyle('top' , y + 'px');
            
            // now blast this update now
            pan._blastStyles();
        },
*/
        settime: function(pan, speed) {

            if (speed == 0) {
                pan.removeStyle(Minx.anim.transpeed);

            } else {

                pan.setStyle(Minx.anim.transpeed, speed + 'ms');
            }
        }
    };


}
else if ($.browser.gecko || $.browser.mozilla) {
// else if (false) {
// FireFox accelerated animations

    Minx.anim = {
        trans: '-moz-transform',
        transpeed: '-moz-transition-duration',

         getTranslate: function(x, y) {
            return 'translate(' + x + 'px,' + y + 'px)';
        },


        setpos: function(pan, x, y) {
           pan.setStyle(Minx.anim.trans, this.getTranslate(x, y));
            
        },

        settime: function(pan, speed) {
            if (speed == 0) {
                pan.removeStyle(Minx.anim.transpeed);

            } else {

                pan.setStyle(Minx.anim.transpeed, speed + 'ms');
            }
        }
    };

}
else {

    // NO support for translate - or for debugging so can set fixed positions

    // None accelerated animations - left and right
    // timings of transitions are specified in the CSS


    Minx.anim = {

        getTranslate: function(x, y) {
            return 'translate(' + x + 'px,' + y + 'px)';
        },



        setpos: function(pan, x, y) {
            pan.setStyle('left', x + 'px');
            pan.setStyle('top',  y + 'px');
        },
        settime: function(pan, speed) {
        }
    };

}

// for web aps lets alow the split view to fully rezize
Minx.Layout.SplitLayout.prototype.reOrient = function(initial) {

        var nisPort = (Minx.pm.dims.or === 'p');
        
        this._isPort = nisPort;
        if(nisPort) {
            this._setPortrait(initial);
        }
        else {
            this._setLandscape(initial);
        }
  
    };

})();