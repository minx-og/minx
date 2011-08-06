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

    },

    eventParse: function(event) {
        // augement with explicit id
        // e must be in the param object

        // currentTarget - the element that recieved the event
        return {id: event.currentTarget.id, e: event};
    },


    getRowMarkup: function(parentId, row, li) {
        var div = document.createElement('div');
        div.setAttribute('class', 'mx-row');

        var ipType = 'input';
        if(row.type == 'select') {
            ipType = 'select';

            delete row['type'];
        }

        if(row.type == 'break') 
        {
            li.setAttribute('class', 'break');
        }
        else if(row.type == 'title') 
        {
            
            li.setAttribute('class', 'break q-title');

            var tit = document.createElement('h2');
            var disp = document.createTextNode(row.value);

            tit.appendChild(disp);
            div.appendChild(tit);

        }
        else{
            
        
            if(row.style) {
                li.setAttribute('class', row.style);
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


            var ip = document.createElement(ipType);
            ip.setAttribute('id', 'f-'+ this.getId() + '-' + row.name);

            this._fields[row.name] = ip;

            for( var lb in row ) {
                if(lb != 'label' && lb !='options') {
                    ip.setAttribute(lb, row[lb]);    
                }
            }

            

            if(ipType = 'select') {
                for(var op in row.options) {
                    var opt = row.options[op];
                    var on = document.createElement('option');
                    
                    on.setAttribute('value', opt.value);
                    var disp = document.createTextNode(opt.disp);
                    on.appendChild(disp);
                
                    ip.appendChild(on);
                }
            }


            var idiv = document.createElement('div');
            idiv.setAttribute('class', 'mx-input');

            idiv.appendChild(ip);

            div.appendChild(idiv);

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


    