// ==UserScript==
// @name         Example run inside iframe
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (window.top === window.self) {
        //--- Script is on domain_B.com when/if it is the MAIN PAGE.
    }
    else {
        //--- Script is on domain_B.com when/if it is IN AN IFRAME.
        // DO YOUR STUFF HERE.
        console.log(document.querySelectorAll('a'));
    }
})();