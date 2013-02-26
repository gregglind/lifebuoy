/* teach me to firefox */


"use strict";

const tabs = require('tabs');
const activeWindow = require("windows").browserWindows.activeWindow;
const observer = require("observer-service");
const windows = require("windows").browserWindows;
const windowUtils = require("window-utils");
const { Panel } = require("panel");
const timers = require('timers');
const self = require('self');
const { defer } = require("api-utils/promise");
const { setTimeout } = require("api-utils/timer");

/* TODO, clearly, we don't store strings here forever. */
let hints = {
	'searchbar':'Did you know you can search from the urlbar also?',
	'star-button': "you just bookmarked a page!",
	"bookmarks-button":'The STAR BUTTON also bookmarks pages',
	"bookmarks-menu-button":  'The STAR BUTTON also bookmarks pages',
	"identity-box":  "I can tell you lots about pages",

};

let various_buttons = ["back-button", "forward-button", "reload-button",
                   "stop-button", "home-button", "feed-button", "star-button",
                   "identity-popup-more-info-button",
                   "back-forward-dropmarker", "security-button",
                   "downloads-button", "print-button", "bookmarks-button",
                   "history-button", "new-window-button", "tabview-button",
                   "cut-button", "copy-button", "paste-button",
                   "fullscreen-button", "urlbar-go-button", "urlbar-reload-button",
                   "urlbar-stop-button"];


various_buttons.forEach(function(k){if (hints[k] === undefined) {hints[k] = "hint here for use of " + k}});


/* hinty panel, on element */
let hintpanel = function(hint){
	return Panel({
		width: 400,
		height: 100,
		contentURL:  self.data.url('hint.html'),
		contentScript:  "document.getElementById('hint').textContent = self.options.hint",
		contentScriptOptions:  {'hint':hint}
	});
};

let hinttracker = new windowUtils.WindowTracker({
  onTrack: function(window) {
    console.log("tracking",window.location);
    if ("chrome://browser/content/browser.xul" != window.location) return;
    Object.keys(hints).forEach(function(k){
    	let el = window.document.getElementById(k);
    	if (!el) {console.log("element not found:",k);
    	} else {
    	  el.addEventListener('click',
    		function(evt){
    			console.log('click on ',k);
    			hintpanel(hints[k]).show(el);
    			return true;
    		}
    		,false);
    	}
    });
  }
});



/* there must be a smoother way to do this.
   recursive callback style so we can make the sequential */
let demo = function(){
	let hintdemo = new windowUtils.WindowTracker({
	  onTrack: function(window) {
	    console.log("hintdemo",window.location);
	    if ("chrome://browser/content/browser.xul" != window.location) return;
		let _demoit = function(k){
			console.log("_demoit",k);
			let el = window.document.getElementById(k);
			if (!el) {
				console.log("element not found:",k);
				_demoit(keys.pop())
			} else {
				let p = hintpanel(hints[k]);
				p.on("hide", function(){
					this.destroy();
					if (keys.length) {_demoit(keys.pop())}
				});
				p.show(el);
			};
		};
		let keys = Object.keys(hints);
		_demoit(keys.pop());
	  }
	});
};

let helpwidget = require("widget").Widget({
  id: "mozilla-icon",
  label: "help me widget",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function(evt) demo()

});


exports.main = function(options,reason){
	if (options.staticArgs.debug) {
		demo();
		tabs[0].url = "http://mozilla.com";
	}

	tabs[0].url= "http://mozilla.com";  // useful to see a real page.
	Panel({'contentURL': self.data.url("helppanel.html"),height:300,width:300}).show();

};