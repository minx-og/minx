if (typeof BackboneMinxWrap === "undefined") {
    BackboneMinxWrap = {};
} 


// general backbone dataBoundPanel wrapper
BackboneMinxWrap.WidgetView = Backbone.View.extend({ 
    
    initialize: function() {
        // FFS really !!!! needed to bind this to the named functions so that callbacks work
        _.bindAll(this, "render", "allModelFired", "allWidgetFired");    

        this._modelFixed = false;
        this._collection = null;
    },

    // callback that binds to any event on the model
    allModelFired: function(event, model) {
        this.updateWidgetModel(model, true);  
    },

    allWidgetFired: function(panel, thing) {
        // call a registered listener
        if(this._eventListener) {
            this._eventListener(panel, thing);
        }
    },

    // override render hands off to our widget which munges the model and view
    render: function(){

         //DEBUG
            var danow = new Date();
            if(Mtk.xactTimer) 
                console.log("render triggered  - " + (danow - Mtk.xactTimer));
        // combine the view and model
        this._widget.munge();
    },

    updateWidgetModel: function(model, draw) {
        // if we are not using the fixed model - for example a collection then pass the widget the raw model object

        /*

        if(!this._modelFixed) {
            this._widget.setModel(model.toJSON);
        }
        else {
            this._widget.setModel(this._collection.toJSON());   // toJSON actiually creates a pojso - but should check it isnt a copy - is it a reference to the backbone data?
        }

        */

        // TODO - big refactoring

        if(!this._modelFixed) {
            this._widget.setModel(model);
        }
        else {
            this._widget.setModel(this._collection);   // toJSON actiually creates a pojso - but should check it isnt a copy - is it a reference to the backbone data?
        }


        // and render the widget
        if (draw) {
            this.render();
        }
    },

    // called to tell this Widget View it is viewing the whole collecion (Collection events only send the model in the collection i think?)
    setCollection: function(collection) {
        this._modelFixed = true;
        this._collection = collection;
    },

    // my widget to munge stuff
    setWidget: function(widget) {
        this._widget = widget;

        this._widget.onEvents(this.allWidgetFired);
    },
});


// plain old class to marry up the view and widget (now that I have discovered _bindAll)
// we may not need this, thugh i'm still usefull for passing in the el from the Minx widget.
BackboneMinxWrap.WidgetWrap = function(container, type) {    
            
    // make my widget of the correct registered type
    this._widget = Minx.pm.add(container, type);

    // make the backbone view that wraps this widget
    var view = new BackboneMinxWrap.WidgetView({el:this._widget.getNode()});

    // the view need the widget as well
    view.setWidget(this._widget);    

    this.getWidget = function() {
        return this._widget;  
    };

    // if it is a list view bind to any event in teh whole collection  
    this.bindCollection = function(collection) {

        if (view._collection === collection) {
            return
        }

        view.setCollection(collection);    
        this.bindModel(collection);
    };

    
    this.unbindCollection = function() {
        if(view._collection) {
            view._collection.unbind();
        }
    };


    // bind all model events to the WidgetView
    this.bindModel = function(model) {
        // bind to refresh to do a full munge
        model.bind('refresh', view.allModelFired);          // this really does the glue between the view and the collection - is says any update event then call munge

        // and make sure we draw it 
        view.updateWidgetModel(null, true);
    };

    // naughty private fidler but tells me when any clicks on our widget TODO - make a setter
    this.onViewEvents = function(fn) {
        view._eventListener = fn;
    }

};

