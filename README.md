Minx
====

Mixing up javascript generated panels

A simple html 5 panel management library

The concept with this library is simple - you start with no html - inspired by Ext and Sencha touch.
So it needs no selectors or DOM queries or DOM parsers.

Every thing is a panel (or content, outside of the framework) and a panel has a node which is a reference to the dom element - starting with a pseudo root panel which simply binds to document.body.

Each panel forms part of the tree of panels - which pretty much apes the Dom - or at least the Dom that the framework cares about. 

I see minx as a basic window (panel) layout tool where each panel can contain 'widgets' the widgets are likely to be the things wired to  the controller which gives them references to the relevant model - widgets they really only need to know about resize events from the panel manager


Organisation
------------

Minx is pretty much composed of four parts things...

*   core 		- the panel and panel manager and a widget wrap panel. 	
*   more 		- more usefull things like buttone, title bars and popups - and common arrangements of them
*   widgets     - widgets have some graphical behaviour and some data wrapped with a panel
*   layouts		- arangements of multiple things made from 'more' things - a layout is not a panel itself


Panel
-----
The basic unit is a panel - it knows about its parent and any child panels - it makes appropriate nodes in the dom at the right size and postition.

A panel is created by the 

* example 1 - basic panels
Here is the [Panel example](http://mtk-play.appspot.com/stuff/html5.html).


PanelManager
------------
Which adds and removes panels and keeps a flat master list of all panels and assigns an ever increasing unique id to all panels - it does not do much else.

The master list of all panels is a simple id(string) -> object(Panel) map so it is v quick to grab a handle on a panel and get its DOM node.

Normally there is no need to know much about the panel manager, its mainly used when creating registered panels.

var panel = Minx.pm.add();  to create a new default pinned panel:

			// default panel added to the root panel (document.body)
			var panel = Minx.pm.add();
			panel.setSize(800, 600);

            
            var innerPanel = Minx.pm.add(panel);
            innerPanel.setSize(400, 270);

            panel.show();

Or create a registered panel type:

			var button = Minx.pm.add(null, 'button');

PinnedPanel
-----------

Panels dont know how they should behave wrt other panels including thier parents - but pinned panels do.

Pinned Panels can be pinned to thier parents or to siblings (other panels with the same parent) so are much more usefull in auto resizing applications - such as orientation aware applications.

* example 1 - parent pinning
some pinned panels
Here is the [Parent pinned example](http://mtk-play.appspot.com/stuff/html6.html).

* example 2 - parent and sibling pinning
The first bits of this example shows a simple panel with a manually added title-bar, then removes that panel and adds a title-panel (see below)
Here is the [Sibling pinned example](http://mtk-play.appspot.com/stuff/html7.html).


Tool-Bar
---------
Is a pinned Panel that can be docked to the top or bottom of a page so is pinned to the top, or bottom and left, and right edges of its parent, sets itself to a fixed height, and adds a class so that it can be styled as a title bar

* example 2
The first bits of this example shows a simple panel with a manually added title-bar
Here is the [Title-Panel example](http://mtk-play.appspot.com/stuff/html8.html).


Title-Panel 
-----------

A simple panel containing a top docked tool-bar and a pinned-panel for content, which is pinned to its parent panel left, right, and to the bottom of the title-bar


The first example shows a simple panel with a manually added title-bar, then removes that panel and adds a title-panel
Here is the [Title-Panel example](http://mtk-play.appspot.com/stuff/html8.html).

Orientation change and Pop Up
-----------------------------

Dyanmic repositioning pinning unpinning and popups based on viewport geometry
Here is the [Dynamic panel example](http://mtk-play.appspot.com/stuff/html9.html).


Input pop
---------

A popup panel that looks like it can take input - it has a bottom pinned lool-bar
Here is the [Input popup panel example](http://mtk-play.appspot.com/stuff/html9-a.html).


Added concept of Minx.Layout
----------------------------

A layout is an object that composes panels in a way that coordinates well

* Minx.Layout.SplitLayout - a typical ipad type splitview
Here is the [SplitLayout example](http://mtk-play.appspot.com/stuff/html10.html).




Acknowledgements
----------------

For sizing info and general awesome advice  [Quirks Mode ViewPort Article](http://www.quirksmode.org/mobile/viewports.html).

Quick none wrapping OO Class stuff the fast small [My.Class](https://github.com/jiem/my-class) because it is prototype based it is slightly clunky to use [more info](http://myjs.fr/my-class/) - License

