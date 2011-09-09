/*
ListScrollPanel - registered as list-scroll-panel
=================================================

one event 'click' on a list item
*/


Minx.ListScrollPanel = my.Class(Minx.DataBoundPanel, {

    constructor: function(parent, id) {
        // call my base constructor
        Minx.ListScrollPanel.Super.call(this, parent, id);

        this._touch = Minx.pm.isTouch(); // saves calling loads
        
        this._scroller = null;         // scroller is not really the view in this case - it is behaviour added, for iScroll the view is the markup

        this._need_new_scroller = true;       // ser if the parent got resized or reattached so we know ro refresh the scroller after a parent panel draw

        this._listLength = 0;           // set by munge used to decide if we really need a scroller
        this._filter = null;            // filter function

        // my defauly stylee
        this.addClass('scroll-content');
        
        // add scrollbars if not touch
        if (!this._touch) {
            // if not touch device then add this...
            this.addClass('scroll-overflow');
        }

        // default renderer
        this._rowRenderer = this.getRowMarkup;

        // for iscroll the view is the dom node of this widget container
        this.setView(this.getNode());

        this._dataByKey = {};           // pointers to each data object
    },


    // called by our default event dispatcher
    eventParse: function(event) {
        // augement with explicit id
        // e must be in the param object
        // currentTarget - the element that recieved the event

        return {id: event.currentTarget.id, e: event};
    },


    // client can set this to do stuff when scrolling starts
    onScrollStart: function(scroller, ev) {
        
    },


    // iScroll can only attach properly when the div it is in is layed out - so create my scroller on first drawing
    draw: function() {

        var wasdirty = this.isDirty();
        Minx.ListScrollPanel.Super.prototype.draw.call(this);

        var me = this;

        // if touch and we need a fresh one and we are not hidden and we have a long enough list
        if (this._touch && this._need_new_scroller && !this.isHidden() && (this._listLength > 2)) {
            // scroller needs t know about div size changes - give it time for animations to take effect
            // timer to give other sht a go                
            setTimeout(function() {
                
                if(me._scroller != null) {
                    me._scroller.destroy();
                    me._scroller = null;
                }

                // create the new scroller
                me._scroller = new iScroll(me.getNode(), {onScrollStart: me.onScrollStart});
                
            }, 310);
        }

        // clear my flag
        this._need_new_scroller = false;
    },


    setKeyField : function(key) {

        this._keyField = key;
    },


    // a callback to return the row content
    setRowRenderer: function(fn) {

        this._rowRenderer = fn;
    },


    getData: function(key) {

        return this._dataByKey[key];
    },


    setFilter: function(filtFunc) {

        this._filter = filtFunc;
    },


    // munge my model into my view called by client manually - likely to be set to an event when the data model changes
    munge: function() {
        // as our munge function completely recreates the ul and all li's in it we may as well recreate the scroller.
        // if we simply call refresh the scroller expects the ul to be the same one that was in place when we created the scroller in the first place

        // this may be sub-optimal - but given the total recreation i doubt it...
        var rawList = this.getModel();
        
        if (rawList == null) {

            throw "munge called, but no model set";
        }

        var list = rawList;

        // do we have a filter
        if (this._filter != null) {

            list = _.select(rawList, this._filter); 
        }

        var view = this.getView();

        // trash any stuff in my node (hope this cleans it out of the dom nicely)....
        if (this._widgetRoot) {

            view.removeChild(this._widgetRoot); 
        }

        // for iscroller we call dom functions on our view
        // my root node is the ul that the iscroller expects
        this._widgetRoot = document.createElement('ul');
        this._widgetRoot.setAttribute('class', this.getClassName());
        
        // fast clicks on all clicks below the ul
        new NoClickDelay(this._widgetRoot);

        view.appendChild(this._widgetRoot);  

        var pId = this.getId();
        // now apply stuff from our model - for now its just hard coded li's
        var li;         // a li for our row
        var liNode;     // the node to attach to the li
        
        var row;        // each row

        var prevli = null      // previous li = used for setting last on rows prior to breaks
        
        for (var h in list) {

            row = list[h];

            this._dataByKey[row[this._keyField]] = row;

            // make a new li for this row
            li = document.createElement('li');
            li.setAttribute('id', row[this._keyField]);       // set element attribute to my id
            
            if (h == 0) {

                li.setAttribute('class', 'first');
            }
            
            if (h == list.length-1) {

                li.setAttribute('class', 'last');
            }

            // capture clicks
            Minx.eq.subscribe(this, li, 'click');

            // call potentially a callback that will return my row content as a node
            liNode = this._rowRenderer(pId, row, li, prevli);
            
            if (liNode != null) {

                li.appendChild(liNode);
            }

            this._widgetRoot.appendChild(li);

            prevli = li;
        }
        
        this._listLength = list.length;
        
        this._need_new_scroller = true;
    },


    // default function assigned to the _rowRenderer callback
    getRowMarkup: function(parentId, row) {
        // for now assume a model with a property 'name'
        var div = document.createElement('div');
        var text = document.createTextNode(row.name);
        div.appendChild(text);

        return div;  
    },


    // override this which is called when the panel resizes
    resized: function() {

        var me = this;
        // super to call any callback
        Minx.ListScrollPanel.Super.prototype.resized.call(this);

        // capture that we did resize so that we know to refresh the scroller after drawing parent
        this._need_new_scroller = true;
    },


    // override this which is called when the panel is reattached
    reattached: function() {

        var me = this;
        // super to call any callback
        Minx.ListScrollPanel.Super.prototype.reattached.call(this);

        // capture that we did resize so that we know to refresh the scroller after drawing parent
        this._need_new_scroller = true;
    },

    
    // private override to decide what html element my node will be
    getMyElement: function() {

        return 'div';
    },


    getClassName: function() {

        return 'scroll-list';
    }
});


// register for the panelmanager factory
Minx.pm.register('list-scroll-panel', Minx.ListScrollPanel);


    