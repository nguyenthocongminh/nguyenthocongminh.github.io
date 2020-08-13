// ==UserScript==
// @name         Userscript Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Mink
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const js_helper_lib = (function () {
        const param = (function () {
            const isIE = function() {
                let ua = window.navigator.userAgent;
                let msie = ua.indexOf("MSIE ");

                if (msie > -1 || !!navigator.userAgent.match(/Trident.*rv:11\./)) {
                    // If Internet Explorer, return true
                    // version = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)))
                    return true;
                }

                // If another browser, return false
                return false;
            };
            const parse_query_string = function(query) {
                let query_string = {};
                if (query) {
                    let vars = query.split("&");
                    for (let i = 0; i < vars.length; i++) {
                        let pair = vars[i].split("=");
                        let key = decodeURIComponent(pair[0]);
                        let value = decodeURIComponent(pair[1]);
                        // If first entry with this name
                        if (typeof query_string[key] === "undefined") {
                            query_string[key] = decodeURIComponent(value);
                            // If second entry with this name
                        } else if (typeof query_string[key] === "string") {
                            query_string[key] = [query_string[key], decodeURIComponent(value)];
                            // If third or later entry with this name
                        } else {
                            query_string[key].push(decodeURIComponent(value));
                        }
                    }
                }
                return query_string;
            };
            const getParam = function(name="") {
                if (isIE()) {
                    let query = window.location.search.substring(1);
                    let parsed_qs = parse_query_string(query);
                    return name?((parsed_qs[name] === undefined)?"":parsed_qs[name]):parsed_qs;
                }
                let url = new URL(window.location.href);
                if (name) {
                    let request_param = url.searchParams.get(name);
                    if ((Array.isArray(request_param) || request_param.length !== undefined) && request_param.length > 0) {
                        if (request_param.length === 1) {
                            return request_param[0];
                        }
                        return request_param;
                    }
                    return "";
                }
                let parsed_qs = {};
                url.searchParams.forEach(function(value, key) {
                    if (parsed_qs[key] === undefined) {
                        parsed_qs[key] = value;
                    } else {
                        let tmp = parsed_qs[key];
                        parsed_qs[key] = [];
                        parsed_qs[key].push(tmp);
                        parsed_qs[key].push(value);
                    }
                });
                return parsed_qs;
            };

            return {
                get: function (name="") {
                    return getParam(name);
                },
            }
        })();

        const addEvent = function(ele, event, func){
            return ele.attachEvent? ele.attachEvent('on'+event, func) : ele.addEventListener(event, func, 0);
        };
        const removeEvent = function(ele, event, func){
            return ele.detachEvent? ele.detachEvent('on'+event, func) : ele.removeEventListener(event, func, 0);
        };

        return {
            param: param,
            addEvent: function(ele, event, func) {
                return addEvent(ele, event, func);
            },
            removeEvent: function(ele, event, func) {
                return removeEvent(ele, event, func);
            },
        }
    })();

    const googledrive = (function() {
        let author_cur = null;
        const googleDriveSpanToLink = (function() {
            const quickAccessIdentity = "[jscontroller='WAgSub']";
            const commonFileIdentity = "[class='WYuW0e']:not(.RDfNAe)";

            const getAllItem = function() {
                let item_list = [quickAccessIdentity, commonFileIdentity];
                let items = item_list.join(",");
                return document.querySelectorAll(items);
            };

            const actionOpenToNewTab = function(e) {
                let user_str = "";
                if (author_cur !== "0") {
                    user_str = "authuser=" + author_cur;
                }
                e.stopPropagation();
                if (e.currentTarget.custom_param.type_1.search("colaboratory") !== -1) {
                    if (user_str) {
                        user_str = '?' + user_str;
                    }
                    return window.open("https://colab.research.google.com/drive/" + e.currentTarget.custom_param.file_id + user_str);
                }
                if (user_str) {
                    user_str = '&' + user_str
                }
                window.open("https://drive.google.com/open?id=" + e.currentTarget.custom_param.file_id + user_str);
                // window.open("https://drive.google.com/file/d/" + e.currentTarget.custom_param.file_id);
            };

            const replaceAction = function() {
                let items = getAllItem();
                for(const [index, ele] of Object.entries(items)) {
                    let typeEleDefine = ele.querySelector("img.a-Ua-c");
                    let type = [];
                    type[0] = typeEleDefine.getAttribute("src").split("/");
                    type[0] = type[0][type[0].length-1];
                    type[1] = typeEleDefine.getAttribute("alt");
                    if (type[0].search("vnd.google-apps") === -1 && type[1].search("Google") === -1 && type[0].search("officedocument") === -1) {
                        let file_id = ele.getAttribute("data-tile-entry-id") || ele.getAttribute("data-id");
                        ele.custom_param = {};
                        ele.custom_param.file_id = file_id;
                        ele.custom_param.type_1 = type[0];
                        ele.custom_param.type_2 = type[1];
                        js_helper_lib.removeEvent(ele, 'dblclick', actionOpenToNewTab);
                        js_helper_lib.addEvent(ele, 'dblclick', actionOpenToNewTab);
                    }
                }
            };

            const obverser = function() {
                replaceAction();
                function mutate(mutations) {
                    mutations.forEach(function(/* mutation */) {
                        replaceAction();
                    });
                }
                let target = document.querySelector('[guidedhelpid="main_container"]');
                let observer = new MutationObserver( mutate );
                let config = { characterData: false, attributes: false, childList: true, subtree: true };

                observer.observe(target, config);
            };

            const run = function() {
                if (window.location.hostname.search('drive.google.com') === -1) {
                    return false;
                }
                let path = window.location.pathname.split('/');
                if (path[1] !== "drive") {
                    return false;
                }
                author_cur = path[3];
                let loop = setInterval(function(){
                    let check = document.getElementsByClassName('a-S a-s-tb-pa a-Zm Hb-ja-hc')[0];
                    if (check !== undefined && check.innerHTML) {
                        clearInterval(loop);
                        obverser();
                    }
                }, 1000);
            };

            return {
                run: run,
            }
        })();

        return {
            googleDriveSpanToLink: googleDriveSpanToLink.run,
        }
    })();

    const google = (function() {
        const videoPreviewToFrame = function() {
            if (window.location.hostname.search('www.google.com') === -1 || js_helper_lib.param.get().q === undefined) {
                return false;
            }
            let needed = document.getElementsByClassName('twQ0Be');
            if (needed.length === 0) {
                return false;
            }
            needed = needed[0];
            let aTag = needed.getElementsByTagName('a');
            if (aTag.length === 0) {
                return false;
            }
            needed.style.height = 'unset';
            needed.style.paddingTop = "56.25%";
            needed.style.position = 'relative';
            aTag = aTag[0];
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
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            needed.innerHTML = '';
            needed.appendChild(iframe);
        };

        return {
            videoPreviewToFrame: videoPreviewToFrame,
        }
    })();

    const freesteamkeys = (function() {
        const onclickToLink = function() {
            if (window.location.hostname.search('freesteamkeys') === -1) {
                return false;
            }
            let btnMain = document.querySelectorAll("a.item-url[rel='nofollow']");
            if (btnMain.length === 0) {
                return false;
            }
            if (btnMain.length > 1) {
                console.log("Ambiguous button link. Feature in contructing");
                return false;
            }
            btnMain[0].href = btnMain[0].getAttribute('onclick').replace(/javascript:window\.open\('([^']+)'\);/gi, "$1");
        };

        return {
            onclickToLink: onclickToLink,
        }
    })();

    if (window.location.hostname.search('freesteamkeys') !== -1) {
        for (const [func_name, func_execute] of Object.entries(freesteamkeys)) {
            console.log(func_name);
            func_execute();
        }
    }

    if (window.location.hostname.search('www.google.com') !== -1) {
        for (const [func_name, func_execute] of Object.entries(google)) {
            console.log(func_name);
            func_execute();
        }
    }

    if (window.location.hostname.search('drive.google.com') !== -1) {
        for (const [func_name, func_execute] of Object.entries(googledrive)) {
            console.log(func_name);
            func_execute();
        }
    }
})();