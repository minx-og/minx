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

        this._lastSelect = null;        // whicj li was last clicked

        // my defauly stylee
        this.addClass('scroll-content');
        
        // add scrollbars if not touch
        if (!this._touch) {
            // if not touch device then add this...
            this.addClass('scroll-overflow');
        }

        // default renderer
        this._rowRenderer = this.getRowMarkup;

        this._listMax = 0;              // wnat a maximum number in this list - set this.

        // for iscroll the view is the dom node of this widget container
        this.setView(this.getNode());

        this._dataByKey = {};           // pointers to each data object
    },


    // called by our default event dispatcher
    eventParse: function(event) {
        // augement with explicit id
        // e must be in the param object
        // currentTarget - the element that recieved the event

        // WARNING - zepto Library dependancy with $
        // remove selected class from last li
        if (this._lastSelect != null) {
            $(this._lastSelect).removeClass("selected");
        }
        
        // add a selected class to the current thing
        $(event.currentTarget).addClass("selected");
        
        this._lastSelect = event.currentTarget;

        return {id: event.currentTarget.id, e: event};
    },


    setMaxListcount: function(count) {

        this._listMax = count;              // wnat a maximum number in this list - set this.  
    },


    clearSelection: function() {

        if (this._lastSelect != null) {
            $(this._lastSelect).removeClass("selected");    
        }
    },


    // client can set this to do stuff when scrolling starts
    onScrollStart: function(scroller, ev) {
        
    },


    // iScroll can only attach properly when the div it is in is layed out - so create my scroller on first drawing
    draw: function(force) {

        var wasdirty = this.isDirty();
        Minx.ListScrollPanel.Super.prototype.draw.call(this, force);

        var me = this;

        // if touch and we need a fresh one and we are not hidden and we have a long enough list
        // have not added force in here, but might have to. It is assumed that the force redraw is after any list content change
        // so multiple forced redraws wont force multiple iscroll recreations
        // only bother drawing me if I am clearly visible on screen
        if (this._touch && this._need_new_scroller && this.isOnScreen() && (this._listLength > 2)) {
            // scroller needs t know about div size changes - give it time for animations to take effect
            // timer to give other sht a go                
            setTimeout(function() {
                
                if(me._scroller != null) {
                    me._scroller.destroy();
                    me._scroller = null;
                }

                console.log("ISCROL - - - - - - > Making new scroller for  " + me.getId());
                //DEBUG
                var danow = new Date();
                if(Mtk.xactTimer) 
                    console.log("before Scroll - " + (danow - Mtk.xactTimer));

                // create the new scroller
                me._scroller = new iScroll(me.getNode(), {onScrollStart: me.onScrollStart});
                
                // clear my flag
                this._need_new_scroller = false;

                console.log("Scroller complete");

                //DEBUG
                var danow = new Date();
                if(Mtk.xactTimer) 
                    console.log("After Scroll - " + (danow - Mtk.xactTimer));
                
            }, 310);            // TODO - as long as the panel is reattached (and as we are not animating dimensions - this timer could be 10ms probably
        }
    },


    // a callback to return the row content
    setRowRenderer: function(fn) {

        this._rowRenderer = fn;
    },


    getData: function(key) {

        return this.getModel().get(key);
    },


    setFilter: function(filtFunc) {

        this._filter = filtFunc;
    },


    // munge my model into my view called by client manually - likely to be set to an event when the data model changes
    munge: function() {
        // as our munge function completely recreates the ul and all li's in it we may as well recreate the scroller.
        // if we simply call refresh the scroller expects the ul to be the same one that was in place when we created the scroller in the first place

        var rawList = this.getModel();      // a backbone collection
        
        if (rawList == null) {

            throw "munge called, but no model set";
        }

        if (this._firstModel && rawList.length == 0)
        {
            console.log("first munge on empty list so doing nothing");
            return;
        }

        console.log("----------------------> MUNGING <---------------------")

        this.setContentChanged(true);
        

        var list = rawList;

        // do we have a filter
        if (this._filter != null) {

            list = rawList.filter(this._filter);        // references to the original model, but a subset?
        }

        var view = this.getView();                       // a backbone view 

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
        
        // consider each if it is a backbone model
        for (var h in list.models) {

            console.log(h);


            row = list.models[h];

            console.log(row);

            // this._dataByKey[row[this._keyField]] = row;       // should purely be pointers to the raw data, which is normally wrapped in a backbone object

            // make a new li for this row
            li = document.createElement('li');
            li.setAttribute('id', row.get('id')); // this._keyField]);       // set element attribute to my id
            
            if (h == 0) {

                li.setAttribute('class', 'first');
            }
            
            if (h == list.length-1) {

                li.setAttribute('class', 'last');
                if (h == 0) {
                    li.setAttribute('class', 'first last');
                }
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

            if (this._listMax > 0) {

                if (h > this._listMax) {

                    break;
                }
            } 
        }
        
        this._listLength = list.length;
        
        if (this._listMax > 0) {
            list.length < this._listLength ? list.length : this._listLength;
        }



                 //DEBUG
            var danow = new Date();
            if(Mtk.xactTimer) 
                console.log("munge done  - " + (danow - Mtk.xactTimer));


        this.render(true);

        // IMPORTANT  - dont move this before the render - why? i dont fucking know!
        this._need_new_scroller = true;

        
    },


    // default function assigned to the _rowRenderer callback
    getRowMarkup: function(parentId, row) {
        // for now assume a model with a property 'name'
        var div = document.createElement('div');
        var text = document.createTextNode('unimplemented row view');
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


    