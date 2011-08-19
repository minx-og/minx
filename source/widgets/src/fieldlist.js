/*
FieldList - registered as list-scroll-panel
=================================================

one event 'click' on a list item
*/

Minx.FieldListPanel = my.Class(Minx.ListScrollPanel, {

    constructor: function(parent, id) {
        // call my base constructor
        Minx.FieldListPanel.Super.call(this, parent, id);

        this.setKeyField('name');

        this.fillParent(1);

        this._fields = {};

        this._afterBreak = false;       // set if we had a break - so then must set this row a first row

        this._eventHandler = function(thing) {};    // empty

    },


    // this is called by the default event handler - and returned so you can add other stuff
    eventParse: function(event) {
        // augement with explicit id
        // e must be in the param object
        // currentTarget - the element that recieved the event
        console.log("fl event");
        var thing = {id: event.currentTarget.id, e: event};
        this._eventHandler(thing);

        return thing;
    },


    setListener: function(cb) {
        this._eventHandler = cb;
    },


    getRowMarkup: function(parentId, row, li, prevli) {
        var me = this;

        if (typeof prevli === "undefined") {
            prevli = null;
        }

        var liClass = li.getAttribute('class');                           // li style to build up
        if (liClass == null) {
            liClass = "";
        }

        console.log("passing in this row class : " + liClass);

        var div = document.createElement('div');
        div.setAttribute('class', 'mx-row');

        var ipType = 'input';
        if(row.type == 'select') {
            ipType = 'select';

            delete row['type'];
        }

        console.log("after break = " + this._afterBreak);

        if ( this._afterBreak && (row.type != 'break') && (row.type != 'title')) {
            // this row ends a break so set class first

            console.log("got a na fter break");
            liClass = liClass + " first";
            this._afterBreak = false;
        }


        if (row.type == 'break') {
            
            liClass = liClass + " break";
            
            if (prevli != null) {                               // add on last to the previous rows class
                var atts = prevli.getAttribute('class');
                if (atts == null) {
                    atts = "";
                }
                atts = atts + " last";
                console.log("prevli class ---> " + atts);
                prevli.setAttribute('class', atts);   
            }
            this._afterBreak = true;
        }
        else if(row.type == 'title') {
            
            liClass = liClass + " break q-title";

            var tit = document.createElement('h2');
            var disp = document.createTextNode(row.value);

            tit.appendChild(disp);
            div.appendChild(tit);

        }
        else if(row.type == 'button') {

            if(row.label) {

                liClass = liClass + " fl-button";
                var disp = document.createTextNode(row.label);

                div.appendChild(disp);


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


                var bh = document.createElement('div');
                bh.setAttribute('class', 'toggle-holder');
                ip.appendChild(bh);


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

                /*
                ip.innerHTML = '\
                    <div class="buttontrack-better">\
                
                        <div class="button-better"></div>\
                        <div class="label-better">\
                            <div class="on">On</div>\
                            <div class="off">Off</div>\
                        </div>\
                    </div>'
                */

                if(row.value != 'on') {
                    bh.setAttribute('class', 'toggle-holder off');
                }
            
                div.addEventListener("click", function(){
                    
                    if (me._fields[row.name].value == 'off') {
                        //li.setAttribute("style", "background-color: blue;");        
                        bh.setAttribute('class', 'toggle-holder on');
                        me._fields[row.name].value = 'on';
                    }
                    else {
                        bh.setAttribute('class', 'toggle-holder off');
                        me._fields[row.name].value = 'off';
                    }

                }, true);   // let it bubble around

/*
                ip.addEventListener("mouseup", function(){
                    li.setAttribute("style", "");    
                }, true);   // let it bubble around
*/
            


            }
            else {

                console.log("field type " + ipType);
                
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
                    // iphone only??
                    console.log("turn off auto shit");
                    ip.setAttribute("autocorrect", "off");
                    ip.setAttribute("autocomplete", "off");
                    ip.setAttribute("autocapitalize", "off");
                }
            }

            var idiv = document.createElement('div');
            idiv.setAttribute('class', 'mx-input');

            idiv.appendChild(ip);

            div.appendChild(idiv);

        }

        if( liClass != "" ) {
            console.log("Setting row li class ---> " + liClass);
            li.setAttribute('class', liClass);
        }

        return div;
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


    // title-panel styles, and a thin border
    getClassName: function() {
        return 'field-list';
    },
});


// register for the panelmanager factory
Minx.pm.register('field-list-panel', Minx.FieldListPanel);


    