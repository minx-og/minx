/* 

Button registered as button
===========================




each button contains the following html....

<div class="button bordered back">
    <span class="pointer"></span>
    <div class="content">
        <span class="label">Blah</span>
    </div>
</div>






*/

Minx.Button = my.Class(Minx.PinnedPanel, {
    constructor: function(parent, id) {
        Minx.Button.Super.call(this, parent, id);

        this.buttonEvent = null;                                 // stored event for default button

        this.setSize(70, 30);
        this.setPos(10, 10);
        
        this.addClass('button-up');

        if (Minx.pm.isTouch() && !Minx.pm.localMobileTest) {    // DEBUG flag - remove?
            Minx.eq.subscribe(this, null, 'touchstart');
            Minx.eq.subscribe(this, null, 'touchend');
            Minx.eq.subscribe(this, null, 'click');             // need click so we can swallow it to stop other stuff
        }
        else {

            // register my events in Minx.eq wrapper 
            Minx.eq.subscribe(this, null, 'mousedown');         // null means whatever node I get made
            Minx.eq.subscribe(this, null, 'mouseup');
            Minx.eq.subscribe(this, null, 'click');             // swallow clicks
        }

        this._type = 'none';
        this._group = null;                             // the group is the form that can get keypresses

        // must give me a default type to create the label node
        this.setType('normal');
    },


    addToGroup: function(panel) {
        this._group = panel;
    },

    
    // last thing called in the construction - so overrides stuff
    _onCreation: function() {
        // buttons just stay within thier parents
        this.setAnimate(false);
    },


    // set a click handler - special one for buttons
    onClick: function(fn) {
        this._clickEvent  = fn; 
    },


    // this is what gets called by the event 
    eventFired: function(ev) {
        // call my behaviour
        if(ev.type == 'mousedown') this.buttonPressed(ev);
        if(ev.type == 'mouseup') this.buttonReleased(ev);

        if(ev.type == 'touchstart') this.buttonPressed(ev);
        if(ev.type == 'touchend') this.buttonReleased(ev);

        if(ev.type == 'keypress') this.keyPressed(ev);          //TODO check this isnt bound for the button - the panel has it

        // then call super to trigger any external listener
        Minx.Button.Super.prototype.eventFired(this, ev);
    },


    buttonPressed: function(e) {
        this.removeClass('button-up');
        this.addClass('button-down');
        this.show();
    },


    buttonReleased: function(e) {
        this.removeClass('button-down');
        this.addClass('button-up');
        this.show();
        if(this._clickEvent) {
                this._clickEvent(this, e);
        }
    },


    // only a defualt key should be bound to the keypress event
    keyPressed: function(e) {
        if (e.charCode == 13) {
            if(this._clickEvent) {
                this._clickEvent(this, e);
            }
        }
    },


    setText: function(text) {
        this._textNode.data = text;
    },
    

    setType: function(type) {
        var me  = this;

        // remove any inner nodes - if the type is changing 
        if(type !== me._type) {
            // remove any specific classes
            this.removeClass('back');
            this.removeClass('next');
             
            while(me._node.lastChild) {
                me._node.removeChild(me._node.lastChild);
            }
        }

        var text = "Button";

        if(type == 'back') {
    
            // default text
            text = 'Back';    

            // create stuff for the button
            this.addClass('back');

            // create the pointer span
            var sp = document.createElement('span');
            sp.setAttribute('class', 'pointer');
            this._node.appendChild(sp);
        
            // calculate my maths for dynamic sizing of pointer  
            var h = this.getNewDims().h - 0.5;

            
            // legth of side is sqrt(2) * h/2 + r(1 - tan(2.5))
            // i.e. .707 * h + .585 * r
            var r = 8;          // fixed in css
            var nw = (0.707 * (h)) + (.585 * r) + 0.5;   

            var offTop = (h - nw)/2;
            var offLeft = nw/2 ;


            //the above maths redundant with transforms 


            // add sizing to the span element
            //sp.style.cssText = 'width: ' + nw + 'px; height: ' + nw + 'px; top:' + offTop + 'px; left: -' + offLeft + 'px;'; 

            var h = nw + 1.5;
            var h2 = h/2;
            
            var off = Math.sqrt(Math.pow((h/2),2)/2);
            offLeft = off - 1.5;
            offTop = off + .5;
            
            sp.style.cssText = 'width: ' + h + 'px; height: ' + h + 'px; -webkit-transform: rotate(45deg) translate3d(-'+offLeft+'px, '+ offTop +'px, 0px);'

/*
            26

            -13, 1.7

            h,w = 27
            -8, 9
*/
            // TODO: if i'm pinned left then increase my offset for a back button
            if(this._pPin.l >= 0) {
                this._pPin.l = this._pPin.l + offLeft;
            }
                // same if pinned to a sibling
            if(this._sPin.l != null) {
                this._sPin.l.off =this._sPin.l.off + offLeft;
            }

        }
        else { 
                // do nothing special for a vanilla button
        }

        // add the text span
        addTextSpan(text);

        me._type = type;

        // utility nested functions 
        function addTextSpan(text) {  
            
            
            me._label = document.createElement('span');
            me._label.setAttribute('class', 'label');
            
            me._node.appendChild(me._label);  

            me._textNode = document.createTextNode(text);
            me._label.appendChild(me._textNode);  

            // calculate my maths for dynamic sizing of pointer  

            var h = me.getNewDims().h - 0.5;

            me._label.style.cssText = "visibility: inherited; line-height: " + h + "px";


        }
    },


    getClassName: function() {
        return 'button';
    },
    

    getMyElement: function() {
        return 'div';
    },
});


Minx.pm.register('button', Minx.Button);


    