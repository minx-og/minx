if (typeof BackboneMinxWrap === "undefined") {
    BackboneMinxWrap = {};
} 


// general backbone widgetpanel wrapper
BackboneMinxWrap.WidgetView = Backbone.View.extend({ 
    
    initialize: function() {
        // FFS really !!!! needed to bind this to the named functions so that callbacks work
        _.bindAll(this, "render", "allModelFired", "allWidgetFired");    

        this._modelFixed = false;
    },

    // callback that binds to any event on the model
    allModelFired: function(event, model) {
        // if we are not using the fixed model - for example a collection then pass the widget the raw model object
        if(!this._modelFixed) {
            this._widget.setModel(model.toJSON);
        }
        // and render the widget
        this.render();
    },

    allWidgetFired: function(panel, thing) {
        console.log(panel);  
        console.log(thing);
        // call a registered listener
        if(this._eventListener) {
            this._eventListener(panel, thing);
        }
    },

    // render hands off to our widget which munges the model and view
    render: function(){
        // combine the view and model
        this._widget.munge();
    },

    // called to tell this Widget View it is viewing the whole collecion (Collection events only send the model in the collection i think?)
    setCollection: function(collection) {
        this._modelFixed = true;
        this._widget.setModel(collection.toJSON());
    },

    // my widget to munge stuff
    setWidget: function(widget) {
        this._widget = widget;

        this._widget.onEvents(this.allWidgetFired);
    },
});
// TODO: fart a lot
// plain old class to marry up the view and widget (now that I have discovered _bindAll)
// we may not need this, thugh i'm still usefull for passing in the el from the Minx widget.
BackboneMinxWrap.WidgetWrap = function(container, type) {    
            
    // make my widget of the correct registered type
    var widget = Minx.pm.add(container, type);

    // make the backbone view that wraps this widget
    var view = new BackboneMinxWrap.WidgetView({el:widget.getNode()});

    // the view need the widget as well
    view.setWidget(widget);    

    // if it is a list view bind to any event in teh whole collection  
    this.bindCollection = function(collection) {
        view.setCollection(collection);    
        this.bindModel(collection);
    }

    // bind all model events to the WidgetView
    this.bindModel = function(model) {
        model.bind('all', view.allModelFired);

        // and make sure we draw it 
        view.render();
    },

    // naughty private fidler - make a setter
    this.onViewEvents = function(fn) {
        view._eventListener = fn;
    }

};

