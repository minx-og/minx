/*
FieldList - registered as list-scroll-panel
=================================================

one event 'click' on a list item
*/

Minx.FieldListPanel = my.Class(Minx.ListScrollPanel, {

    constructor: function(parent, id) {
        // call my base constructor
        Minx.FieldListPanel.Super.call(this, parent, id);

        this.fillParent(1);

        // state based on the model
        this._fields = {};              // these three are dependant on the model - so should be trashed on any new model or model munge
        this._titles = {};              
        this._toggles = {};

        this._afterBreak = false;       // set if we had a break - so then must set this row a first row

        this._eventHandler = function(thing) {};    // empty

        this._focussed = null;                  // focussed
        this._defaultButton = null;
        this._animate = 0;

        var me = this;
        
        // does this replace the base function ??
        this.onScrollStart = function(scroller, ev) {
            if (me._focussed) {
                me._focussed.blur();
                me._focussed = null;
            }
        }

        Minx.eq.subscribe(this, this.getNode(), 'keyup');    // register for keypresses
    },


    setModel: function(model) {
        var qs = new Backbone.Collection(model, {keyfield: 'name'});

        Minx.FieldListPanel.Super.prototype.setModel.call(this, qs);
    },
    

    setDefault: function(panel) {                               // can override field list default with an external button
        this._defaultButton = panel;
        // tell this panel to draw and 'default' class stuff 
        panel.addClass("default");
    },


    // this is called by the default event handler - and returned so you can add other stuff
    // only subscribed 
    //    - keyup
    //    - click - (from base class)
    eventParse: function(event) {
        // augement with explicit id
        // e must be in the param object
        // currentTarget - the element that recieved the event
        var thing = {id: event.currentTarget.id, e: event};

        // if it is an enter press - then use the id of the defualt button
        // there may not be a defult button if the enclosing form has one - e.g. inputpopup
        if (event.type == "keyup") {

            if((this._defaultButton != null ) && (event.keyCode == 13)) {
                thing = {id: this._defaultButton.id, e: event};
                this._eventHandler(thing);
            }
            // swallow keyups if its not a return and there is no default button
        }
        else {
            // this would only be a click last time I looked - check what the base listscrollpanel subscribes to
            this._eventHandler(thing);
        }

        return thing;
    },


    setListener: function(cb) {
        this._eventHandler = cb;
    },


    updateTitle: function(id, value) {
        var disp = document.createTextNode(value);
        var tit = this._titles[id];
        
        // only one child
        tit.removeChild( tit.firstChild );

        tit.appendChild(disp);
    },


    updateToggle: function(id, value) {

        var fld = this._fields[id];
                
        if ((value == 'false') || (value == false)) {
            value = 'off';    
        }

        if ((value == 'true') || (value == true)) {
            value = 'on';    
        }

        fld.value = value;

        var tog = this._toggles[id];
        if (value == 'on') {
            tog.bh.setAttribute('class', 'toggle-holder on');
            tog.bc.setAttribute('class', 'toggle-back');
        }
        else {
            tog.bh.setAttribute('class', 'toggle-holder off');
            tog.bc.setAttribute('class', 'toggle-back off');
        }
    },


    getRowMarkup: function(parentId, backRow, li, prevli) {
        // now row is a backbone model

        var row = backRow.toJSON();

        var me = this;

        if (typeof prevli === "undefined") {
            prevli = null;
        }

        var liClass = li.getAttribute('class');                           // li style to build up
        if (liClass == null) {
            liClass = "";
        }

        var div = document.createElement('div');
        div.setAttribute('class', 'mx-row');

        var ipType = 'input';
        if(row.type == 'select') {
            ipType = 'select';

            delete row['type'];
        }

        if ( this._afterBreak && (row.type != 'break') && (row.type != 'title')) {
            // this row ends a break so set class first
            liClass = liClass + " first";
            this._afterBreak = false;
        }

        if (row.type == 'break' || row.type == 'title') {
            if (prevli != null) {                               // add on last to the previous rows class
                var atts = prevli.getAttribute('class');
                if (atts == null) {
                    atts = "";
                }
                atts = atts + " last";
                prevli.setAttribute('class', atts);   
            }
        }
        if (row.type == 'break') {
            
            liClass = liClass + " break";
            
            this._afterBreak = true;
        }
        else if(row.type == 'title') {
            
            liClass = liClass + " break q-title";

            var tit = document.createElement('h2');
            var disp = document.createTextNode(row.value);

            tit.appendChild(disp);
            div.appendChild(tit);

            this._titles[row.name] = tit;
            this._afterBreak = true;
        }
        else if(row.type == 'button') {

            if(row.label) {

                liClass = liClass + " fl-button";
                var disp = document.createTextNode(row.label);

                div.appendChild(disp);

                // if this is the default button then store it so we can use this id when enter pressed
                if (row.isdefault) {
                    this._defaultButton = li;
                    liClass = liClass + " fl-default";  // give it summink so we can draw it as defult if we want
                }

                
// handle mousedown stlyes ourselves ?
/*
                div.addEventListener("mousedown", function(){
                    li.setAttribute("style", "background-color: blue;");    
                }, true);   // let it bubble around

                div.addEventListener("mouseup", function(){
                    li.setAttribute("style", "");    
                }, true);   // let it bubble around

*/

                // div.setAttribute("class", "first last");
             
             // actual button ??
             /*   
                var idiv = document.createElement('button');
                idiv.setAttribute('type', 'button');
                idiv.setAttribute('style', 'width: 100%; height:100%; border-style: none; background-color: blue;');

                div.appendChild(idiv);
             */


            }
        }
        else {
            
        
            if(row.style) {
                liClass = liClass + " " + row.style;
            }

            
            if(row.label) {
                var idiv = document.createElement('div');
                idiv.setAttribute('class', 'mx-label');

                var lb = document.createElement('label');
                lb.setAttribute('for', row.name);

                var label = document.createTextNode(row.label);
                lb.appendChild(label);
                
                idiv.appendChild(lb);
                div.appendChild(idiv);
            }

            if (row.type == "toggle") {
                ipType = 'div';
            }

            var ip = document.createElement(ipType);
            ip.setAttribute('id', 'f-'+ this.getId() + '-' + row.name);

            this._fields[row.name] = ip;

            if (row.type == "toggle") {
                ip.setAttribute('class', 'toggle-button-wrap');


                var bc = document.createElement('div');
                bc.setAttribute('class', 'toggle-back');
                ip.appendChild(bc);


                var bh = document.createElement('div');
                bh.setAttribute('class', 'toggle-holder');
                bc.appendChild(bh);

                var iii = document.createElement('div');
                iii.setAttribute('class', 'toggle-label on');
                bh.appendChild(iii);

                tt = document.createTextNode("On");
                iii.appendChild(tt);

                var bb = document.createElement('div');
                bb.setAttribute('class', 'toggle-button');
                bh.appendChild(bb);

                var iii = document.createElement('div');
                iii.setAttribute('class', 'toggle-label off');
                bh.appendChild(iii);

                tt = document.createTextNode("Off");
                iii.appendChild(tt);

                this._fields[row.name].value = 'off';

                if(row.value != 'on') {
                    bh.setAttribute('class', 'toggle-holder off');
                }

                this._toggles[row.name] = {bh:bh, bc:bc};

                function drawOnOrOff() {
                    me.updateToggle(row.name, me._fields[row.name].value);
                }
                
                function toggleOnOrOff() {

                    if (me._fields[row.name].value == 'off') {

                        me._fields[row.name].value = 'on';
                    }
                    else {

                        me._fields[row.name].value = 'off';
                    }

                    drawOnOrOff();
                } 
            
                div.addEventListener("click", toggleOnOrOff, false);
                
                // and set it in the correct state
                drawOnOrOff();
            }
            else {

                for( var lb in row ) {
                    if(lb != 'label' && lb !='options') {
                        ip.setAttribute(lb, row[lb]);
                    }
                }

                if(ipType == 'select') {
                    for(var op in row.options) {
                        var opt = row.options[op];
                        var on = document.createElement('option');
                        
                        on.setAttribute('value', opt.value);
                        var disp = document.createTextNode(opt.disp);
                        on.appendChild(disp);
                    
                        ip.appendChild(on);
                    }
                }
                else {
                    // turn off all the clever field shit
                    ip.setAttribute("autocorrect", "off");
                    ip.setAttribute("autocomplete", "off");
                    ip.setAttribute("autocapitalize", "off");


                    ip.addEventListener('focus', function(e){
                        me._focussed = ip;
                    }, false);
                }
            }

            var idiv = document.createElement('div');
            idiv.setAttribute('class', 'mx-input');

            idiv.appendChild(ip);

            div.appendChild(idiv);

        }

        if( liClass != "" ) {
            li.setAttribute('class', liClass);
        }

        return div;
    },


    munge: function() {

        // these three lists are dependant on the model - so munge is normaly fired when the model changes so trash them now
        this._fields = {};              
        this._titles = {};              
        this._toggles = {};

        Minx.FieldListPanel.Super.prototype.munge.call(this);  
    },
    

    getAnswers: function() {
        var answers = {};
        for(fld in this._fields) {
            answers[fld] = this._fields[fld].value;
        }

        return answers;
    },


    getField: function(fld) {
        return this._fields[fld];
    },


    // this has to be a form to capture keypresses
    getMyElement: function() {
        return 'form';
    },


    // title-panel styles, and a thin border
    getClassName: function() {
        return 'field-list';
    },
});


// register for the panelmanager factory
Minx.pm.register('field-list-panel', Minx.FieldListPanel);


    