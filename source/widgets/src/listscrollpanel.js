/*
ListScrollPanel - registered as list-scroll-panel
=================================================

one event 'click' on a list item
*/

Minx.ListScrollPanel = my.Class(Minx.WidgetPanel, {

    constructor: function(parent, id) {
        // call my base constructor
        Minx.ListScrollPanel.Super.call(this, parent, id);

        this._touch = Minx.pm.isTouch(); // saves calling loads
        
        this._scroller = null;         // scroller is not really the view in this case - it is behaviour added, for iScroll the view is the markup

        this._didResize = false;       // ser if the parent got resized so we know ro refresh the scroller after a parent panel draw

        // my defauly stylee
        this.addClass('scroll-content');
        
        // add scrollbars if not touch
        if(!this._touch) {
            // if not touch device then add this...
            this.addClass('scroll-overflow');
        }

        // default renderer
        this._rowRenderer = this.getRowMarkup;

        // for iscroll the view is the dom node of this widget container
        this.setView(this.getNode());
    },

    eventParse: function(event) {
        // augement with explicit id
        // e must be in the param object
        return {id: event.srcElement.id, e: event};
    },

    // iScroll can only attach properly when the dic it is in is layed out - so create my scroller on first drawing
   draw: function() {
        var wasdirty = this.isDirty();
        Minx.ListScrollPanel.Super.prototype.draw.call(this);

        var me = this;

        // if touch and we dont have one allready
        if(this._touch) {
            if(this._scroller == null) {
                // create a new scroller for my id
                this._scroller = new iScroll(this.getId());
            }
            else if(wasdirty && this._didResize) {
                // scroller needs t know about div size changes - give it time for animations to take effect
                setTimeout(function() {
                    me._scroller.refresh();    
                }, 310);
            }
        }

        // clear my flag
        this._didResize = false;
    },

    // a callback to return the row content
    setRowRenderer: function(fn) {
        this._rowRenderer = fn;
    },

    // munge my model intomy view 
    munge: function() {

        var view = this.getView();

        // trash any stuff in my node....
        if(this._widgetRoot) {
            view.removeChild(this._widgetRoot); 
        }


        // for iscroller we call dom functions on our view
        // my root node is the ul that the iscroller expects
        this._widgetRoot = document.createElement('ul');
        
        view.appendChild(this._widgetRoot);  

        var pId = this.getId();
        // now apply stuff from our model - for now its just hard coded li's
        var li;
        var liNode;
        
        var list = this.getModel();
        console.log(list);

        var row;
        for(var h in list) {
            row = list[h];
            
            li = document.createElement('li');
            li.setAttribute('id', pId + "-i" + h);

            // capture clicks
            Minx.eq.subscribe(this, li, 'click');

            // call potentially a callback that will return my row content as a node
            liNode = this._rowRenderer(pId, row);
            if(liNode != null) {
                li.appendChild(liNode);
            }

            this._widgetRoot.appendChild(li);
        }
    },

    getRowMarkup: function(parentId, row) {
        // for now assume a model with a property 'name'
        var div = document.createElement('div');
        var text = document.createTextNode(row.display);
        div.appendChild(text);
        return div;  
    },

    resized: function() {
        var me = this;
        // super to call any callback
        Minx.ListScrollPanel.Super.prototype.resized.call(this);

        // capture that we did resize so that we know to refresh the scroller after drawing parent
        this._didResize = true;
    },
    
    // private override to decide what html element my node will be
    getMyElement: function() {
        return 'div';
    },

});

// register for the panelmanager factory
Minx.pm.register('list-scroll-panel', Minx.ListScrollPanel);


    