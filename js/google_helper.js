// ==UserScript==
// @name         Google Helper
// @namespace    https://nguyenthocongminh.github.io/js/user_script
// @version      0.1
// @description  try to take over the world!
// @author       Mink
// @match        *://*.youtube.com/*
// @match        *://*.google.com/*
// @grant        none
// @require      https://nguyenthocongminh.github.io/js/user_script/js_helper.js
// ==/UserScript==

(function() {
    'use strict';

    if (window.top === window.self) {
        //--- Script is on domain_B.com when/if it is the MAIN PAGE.
        if (window.location.hostname.search('www.google.com') !== -1 && js_helper_lib !== undefined && js_helper_lib.param.get().q !== undefined) {
            let needed = document.getElementsByClassName('twQ0Be');
            if (needed.length > 0) {
                needed = needed[0];
                let aTag = needed.getElementsByTagName('a');
                if (aTag.length > 0) {
                    aTag = aTag[0];
                    needed.style.height = 'unset';
                    needed.style.paddingTop = "56.25%";
                    needed.style.position = 'relative';
                    let link = aTag.href.replace('watch?v=', 'embed/');
                    let iframe = document.createElement('iframe');
                    iframe.src = link;
                    iframe.style.position = 'absolute';
                    iframe.style.top = '0';
                    iframe.style.left = '0';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = '0px';
                    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allowFullScreen', '');
                    needed.innerHTML = '';
                    needed.appendChild(iframe);
                }
            }
        }
    } else {
        //--- Script is on domain_B.com when/if it is IN AN IFRAME.
        // DO YOUR STUFF HERE.
        if (window.self.location.hostname.search('www.youtube.com')) {
            let a = document.querySelectorAll('a');
            a.forEach(function (ele) {
                if (ele.href.search(/^http(s?):\/\/www\.youtube\.com\/*/) !== -1) {
                    console.log(ele.href)
                }
            })
        }
    }
})();