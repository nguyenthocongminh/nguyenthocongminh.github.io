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
            const recentFileIdentity = ".a-u-xb-j";

            const getAllItem = function() {
                let item_list = [quickAccessIdentity, commonFileIdentity, recentFileIdentity];
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
    });

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
    });

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
    });

    const facebook = (function () {
        if (window.location.hostname.search('facebook.com') === -1) {
            return {};
        }

        let fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.type = 'text/css';
        fontAwesome.media = 'all';
        fontAwesome.href = 'https://nguyenthocongminh.github.io/css/all.css';
        document.head.appendChild(fontAwesome);

        let old_ver = (document.getElementsByClassName('sidebarMode').length > 0);
        let allowPlaybackRate = [0.25, 0.5, 1, 1.5, 2, 2.5];

        const addVideoSpeedControl = function () {
            if (old_ver) {
                let _case=0,getCase=function(d){return-1!==d.id.indexOf("more_pager")?1:2},addBtnSpeedToVideo=function(d){let f=d.parentNode.querySelector("._170l._27db").querySelector("._1otk._3t1r._4ubd").querySelectorAll("._1c7f")[2],k=f.querySelector("._2j04");if(null!==k){let e=document.createElement("div");e.className="_2j04";let l=document.createElement("div");l.setAttribute("data-tooltip-content","T\u1ed1c \u0111\u1ed9");l.setAttribute("data-hover","tooltip");l.setAttribute("data-tooltip-position","above");
                    let m=document.createElement("button");m.className="_zbd _42ft";m.setAttribute("tabindex","0");m.setAttribute("type","button");let n=document.createElement("i");n.className="fa fa-bolt _rwt";n.style.width="20px";n.style.height="20px";n.style.display="inline-block";n.style.color="white";n.style.fontSize="20px";e.appendChild(l);l.appendChild(m);m.appendChild(n);f.insertBefore(e,k.nextSibling);e.onclick=function(){let b=this.previousSibling;if(null===this.querySelector("._2iw7._2iw8")){null!==b.querySelector("._2iw7._2iw8")&&
                    b.querySelector("[data-tooltip-content]").click();let c=document.createElement("div");c.setAttribute("class","_2iw7 _2iw8");this.prepend(c);b=document.createElement("div");b.setAttribute("class","_2i_w");c.appendChild(b);let a=document.createElement("div");a.setAttribute("class","_2i_x");c=document.createElement("div");c.setAttribute("class","_2j03");b.appendChild(a);b.appendChild(c);b=d.playbackRate;-1===allowPlaybackRate.indexOf(b)&&(b=null);c=document.createElement("div");c.setAttribute("class",
                        "_4t9q");c.innerText="T\u1ed1c \u0111\u1ed9";a.appendChild(c);c=document.createElement("div");c.setAttribute("class","_4t9z speed-controller");c.setAttribute("role","radiogroup");a.appendChild(c);for(a={$jscomp$loop$prop$i$4:0};a.$jscomp$loop$prop$i$4<allowPlaybackRate.length;a={$jscomp$loop$prop$i$4:a.$jscomp$loop$prop$i$4},a.$jscomp$loop$prop$i$4++){let g=document.createElement("a"),h=b===allowPlaybackRate[a.$jscomp$loop$prop$i$4]?"true":"false";g.setAttribute("class","_2iw4");g.setAttribute("href",
                        "javascript:void(0);");g.setAttribute("tabindex","0");g.setAttribute("aria-checked",h);g.setAttribute("role","radio");g.setAttribute("aria-disabled","false");c.appendChild(g);h=document.createElement("div");h.setAttribute("class","_4t7u");g.appendChild(h);if(b===allowPlaybackRate[a.$jscomp$loop$prop$i$4]){let p=document.createElement("div");p.setAttribute("class","_4t7r");h.appendChild(p)}h=document.createElement("div");h.setAttribute("class","_2iw5");h.innerText=allowPlaybackRate[a.$jscomp$loop$prop$i$4]+
                        "x";g.appendChild(h);js_helper_lib.addEvent(g,"click",function(q){return function(r){r.stopPropagation();d.playbackRate=allowPlaybackRate[q.$jscomp$loop$prop$i$4]}}(a))}}else this.querySelector("._2iw7._2iw8").remove()};js_helper_lib.addEvent(e.previousSibling.querySelector("[data-tooltip-content]"),"click",function(){null!==e.querySelector("._2iw7._2iw8")&&e.querySelector("._2iw7._2iw8").remove()});js_helper_lib.addEvent(d,"ratechange",function(){let b=this.parentNode.querySelector(".speed-controller");
                        if(null!==b){let c=this.playbackRate,a=b.querySelector("._4t7r");null!==a&&a.remove();b=b.querySelectorAll("a");for(a=0;a<b.length;a++)if(c===allowPlaybackRate[a]){b[a].setAttribute("aria-checked","true");let g=b[a].querySelector("._4t7u"),h=document.createElement("div");h.setAttribute("class","_4t7r");g.appendChild(h)}else b[a].setAttribute("aria-checked","false")}})}},mutate=function(d){d.forEach(function(f){let k=f.addedNodes[0];switch(_case){case 1:setTimeout(function(){k=f.addedNodes[0];if(null!==
                    k){let l=k.querySelectorAll("video");if(0<l.length)for(let m=0;m<l.length;m++)addBtnSpeedToVideo(l[m])}},1E3);break;case 2:let e=k.getElementsByTagName("video")[0];void 0!==e&&"object"===typeof e&&e.addEventListener("loadstart",function(){addBtnSpeedToVideo(e)})}})},start_init=function(d){1===arguments.length&&(new MutationObserver(mutate)).observe(d,{characterData:!1,attributes:!1,childList:!0,subtree:!1})},target=document.querySelector("._2jwg div:not([data-pagelet]):not([class])")||document.querySelector('[role="feed"] > [id*="more_pager"]');
                null!==target&&(_case=getCase(target));
                switch(_case){case 1:target=document.querySelector('[role="feed"] > [id*="more_pager"] > div:first-child');let first=document.querySelectorAll('[role="feed"] > ._4ikz');if(null!==first)for(let $jscomp$loop$5={},i=0;i<first.length;$jscomp$loop$5={$jscomp$loop$prop$video$6:$jscomp$loop$5.$jscomp$loop$prop$video$6},i++)$jscomp$loop$5.$jscomp$loop$prop$video$6=first[i].querySelector("video"),null!==$jscomp$loop$5.$jscomp$loop$prop$video$6&&$jscomp$loop$5.$jscomp$loop$prop$video$6.addEventListener("loadstart",function(d){return function(){addBtnSpeedToVideo(d.$jscomp$loop$prop$video$6)}}($jscomp$loop$5));
                    start_init(target);break;case 2:let loop=setInterval(function(){target=document.querySelector("._2jwg div:not([data-pagelet]):not([class])");if(""===target.style.cssText){clearInterval(loop);for(let d=target.querySelectorAll("[class][data-ft]"),f={},k=0;k<d.length;f={$jscomp$loop$prop$video$2$8:f.$jscomp$loop$prop$video$2$8},k++)f.$jscomp$loop$prop$video$2$8=d[k].getElementsByTagName("video")[0],void 0!==f.$jscomp$loop$prop$video$2$8&&"object"===typeof f.$jscomp$loop$prop$video$2$8&&setTimeout(function(e){return function(){addBtnSpeedToVideo(e.$jscomp$loop$prop$video$2$8)}}(f),
                    1E3);start_init(target)}},1E3)}
            } else {

            }
        };

        return {
            addVideoSpeedControl: addVideoSpeedControl,
        }
    });

    if (window.location.hostname.search('freesteamkeys') !== -1) {
        for (const [func_name, func_execute] of Object.entries(freesteamkeys())) {
            console.log(func_name);
            func_execute();
        }
    }

    if (window.location.hostname.search('www.google.com') !== -1) {
        for (const [func_name, func_execute] of Object.entries(google())) {
            console.log(func_name);
            func_execute();
        }
    }

    if (window.location.hostname.search('drive.google.com') !== -1) {
        for (const [func_name, func_execute] of Object.entries(googledrive())) {
            console.log(func_name);
            func_execute();
        }
    }

    if (window.location.hostname.search('facebook.com') !== -1) {
        for (const [func_name, func_execute] of Object.entries(facebook())) {
            console.log(func_name);
            func_execute();
        }
    }
})();