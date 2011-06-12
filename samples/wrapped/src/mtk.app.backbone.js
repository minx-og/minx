if (typeof Mtk === "undefined") {
    Mtk = {};
} 



Mtk.AppStart = function() {
    
    // true to create the first main panel and set it to auto size - this attaches to document.body
    var rootPanel = Minx.pm.init(true);

    // the logon view
    Mtk.Logon = function() {
       
    };

    // the main app view
    Mtk.AppView = function() {
        // create a tablet split view layout
        var mainLayout = new Minx.Layout.SplitLayout(rootPanel);

        //create a phone layout
        /*var mainLayout = new Minx.Layout.NavMainLayout(rootPanel);*/


        // ****** some direct button hookage 

        // add my specific button to pop something up
        var rbutton = mainLayout.getMainPanel().getTitle().addButton('r', 20, 'Pop');

        rbutton.onClick(function(panel,e){
            popup();
        });

        
        // ****** a model driven backbone view where the view recieves the events 

        //------------ get some known panel (navigation) from my splitViewLayout

        // now instantiate my MainMenu Widgetview
        // so ge the menu container from my Split Layout
        var container = mainLayout.getNavPanel().getContentPanel();
        
        // ----------- wrap in a view and instantiate a widget of known type
        // make my widget wrapper for my widget in this container
        var mainMenu = new BackboneMinxWrap.WidgetWrap(container, 'list-scroll-panel');
        
        // ----------- bind a backbone model to my view and hence widget
        // attach the data model to our menu
        mainMenu.bindCollection(Mtk.test_accounts);

        // main menu item click
        mainMenu.onViewEvents(function(panel, ev){
            alert("I know you clicked on - " + ev.id);  
        });
        
        
        // and draw everything attached to the root
        rootPanel.show();


    };


    // directly create an input-pop-up outside backbone wrappers

    function popup(){
        
        var pop = Minx.pm.add('main', 'input-pop-up');
        pop.setSize(400, 300);
       
        var cancelBtn = pop.getFootBar().addButton('l', 10, 'Cancel');
        
        cancelBtn.onClick(function(panel,e){
            pop.hide();
        });
        
        var okBtn = pop.getFootBar().addButton('r', 10, 'Logon');
        
        okBtn.onClick(function(panel,e){
            alert('OK');
        });                    

        pop.show();

    }

    // construct all of the above

    var mtkApp = new Mtk.AppView();

};

// dont need an override for this test yet

/*
Mtk.MenuList = Backbone.Collection.extend({
  
});

Mtk.test_accounts = new Mtk.MenuList([
*/



// some static test data to bind to the backbone view

Mtk.test_accounts = new Backbone.Collection([
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55},
          {name: "Tim", age: 5},
          {name: "Ida", age: 26},
          {name: "Rob", age: 55}
        ]);
