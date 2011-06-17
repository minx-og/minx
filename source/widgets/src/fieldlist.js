/*
ListScrollPanel - registered as list-scroll-panel
=================================================

one event 'click' on a list item
*/

Minx.FieldListPanel = my.Class(Minx.ListScrollPanel, {

    constructor: function(parent, id) {
        // call my base constructor
        Minx.FieldListPanel.Super.call(this, parent, id);

        this.setKeyField('name');

        this.fillParent(1);

    },

    eventParse: function(event) {
        // augement with explicit id
        // e must be in the param object

        // currentTarget - the element that recieved the event
        return {id: event.currentTarget.id, e: event};
    },

    // iScroll can only attach properly when the dic it is in is layed out - so create my scroller on first drawing
    //@override
    draw: function() {
        Minx.FieldListPanel.Super.prototype.draw.call(this);
    },

/*
    setKeyField : function(key) {
        this._keyField = key;
    },

    // a callback to return the row content
    setRowRenderer: function(fn) {
        this._rowRenderer = fn;
    },

    // munge my model intomy view 
    munge: function() {

    },
*/
    
    getRowMarkup: function(parentId, row, li) {
        var div = document.createElement('div');

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

            var ip = document.createElement(ipType);
            
            if(row.label) {
                var lb = document.createElement('label');
                lb.setAttribute('for', row.name);

                var label = document.createTextNode(row.label);
                lb.appendChild(label);
                div.appendChild(lb);
            }

            ip.setAttribute('id', 'f-'+ this.getId() + '-' + row.name);

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

            div.appendChild(ip);

        }
        
        //{name:'name', label: 'Name', type: 'text',   value: '', placeholder: 'name'},
        //{name:'type', label: 'Class', type: 'select', value: '', options:[{value:'upper', disp:'Better'}, {value:'middle', disp:'Worse and Better'},{value: 'lower', disp:'Worse'}]}
        
        

        return div;
    },


    // title-panel styles, and a thin border
    getClassName: function() {
        return 'field-list';
    },

});

// register for the panelmanager factory
Minx.pm.register('field-list-panel', Minx.FieldListPanel);


    