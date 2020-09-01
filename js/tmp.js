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

        let old_ver = (document.getElementsByClassName('_9dls').length === 0);
        let allowPlaybackRate = [0.25, 0.5, 1, 1.5, 2, 2.5];

        const addVideoSpeedControl = function () {
            if (old_ver) {
                let _case=0;const getCase=function(e){return-1!==e.id.indexOf("more_pager")?1:2},addBtnSpeedToVideo=function(e){let t=e.parentNode.querySelector("._170l._27db").querySelector("._1otk._3t1r._4ubd").querySelectorAll("._1c7f")[2],l=t.querySelector("._2j04");if(null===l)return;let a=document.createElement("div");a.className="_2j04";let i=document.createElement("div");i.setAttribute("data-tooltip-content","Tốc độ"),i.setAttribute("data-hover","tooltip"),i.setAttribute("data-tooltip-position","above");let r=document.createElement("button");r.className="_zbd _42ft",r.setAttribute("tabindex","0"),r.setAttribute("type","button");let o=document.createElement("i");o.className="fa fa-bolt _rwt",o.style.width="20px",o.style.height="20px",o.style.display="inline-block",o.style.color="white",o.style.fontSize="20px",a.appendChild(i),i.appendChild(r),r.appendChild(o),t.insertBefore(a,l.nextSibling),a.onclick=function(){let t=this.previousSibling;if(null===this.querySelector("._2iw7._2iw8")){null!==t.querySelector("._2iw7._2iw8")&&t.querySelector("[data-tooltip-content]").click();let l=document.createElement("div");l.setAttribute("class","_2iw7 _2iw8"),this.prepend(l);let a=document.createElement("div");a.setAttribute("class","_2i_w"),l.appendChild(a);let i=document.createElement("div");i.setAttribute("class","_2i_x");let r=document.createElement("div");r.setAttribute("class","_2j03"),a.appendChild(i),a.appendChild(r);let o=e.playbackRate;-1===allowPlaybackRate.indexOf(o)&&(o=null);let n=document.createElement("div");n.setAttribute("class","_4t9q"),n.innerText="Tốc độ",i.appendChild(n);let c=document.createElement("div");c.setAttribute("class","_4t9z speed-controller"),c.setAttribute("role","radiogroup"),i.appendChild(c);for(let t=0;t<allowPlaybackRate.length;t++){let l=document.createElement("a"),a=o===allowPlaybackRate[t]?"true":"false";l.setAttribute("class","_2iw4"),l.setAttribute("href","javascript:void(0);"),l.setAttribute("tabindex","0"),l.setAttribute("aria-checked",a),l.setAttribute("role","radio"),l.setAttribute("aria-disabled","false"),c.appendChild(l);let i=document.createElement("div");if(i.setAttribute("class","_4t7u"),l.appendChild(i),o===allowPlaybackRate[t]){let e=document.createElement("div");e.setAttribute("class","_4t7r"),i.appendChild(e)}let r=document.createElement("div");r.setAttribute("class","_2iw5"),r.innerText=allowPlaybackRate[t]+"x",l.appendChild(r),js_helper_lib.addEvent(l,"click",function(l){l.stopPropagation(),e.playbackRate=allowPlaybackRate[t]})}}else this.querySelector("._2iw7._2iw8").remove()},js_helper_lib.addEvent(a.previousSibling.querySelector("[data-tooltip-content]"),"click",function(){null!==a.querySelector("._2iw7._2iw8")&&a.querySelector("._2iw7._2iw8").remove()}),js_helper_lib.addEvent(e,"ratechange",function(){let e=this.parentNode.querySelector(".speed-controller");if(null!==e){let t=this.playbackRate,l=e.querySelector("._4t7r");null!==l&&l.remove();let a=e.querySelectorAll("a");for(let e=0;e<a.length;e++)if(t===allowPlaybackRate[e]){a[e].setAttribute("aria-checked","true");let t=a[e].querySelector("._4t7u"),l=document.createElement("div");l.setAttribute("class","_4t7r"),t.appendChild(l)}else a[e].setAttribute("aria-checked","false")}})},mutate=function(e){e.forEach(function(e){let t=e.addedNodes[0];switch(_case){case 1:setTimeout(function(){if(null!==(t=e.addedNodes[0])){let e=t.querySelectorAll("video");if(e.length>0)for(let t=0;t<e.length;t++)addBtnSpeedToVideo(e[t])}},1e3);break;case 2:let l=t.getElementsByTagName("video")[0];void 0!==l&&"object"==typeof l&&l.addEventListener("loadstart",function(){addBtnSpeedToVideo(l)})}})},start_init=function(e){if(1===arguments.length){let t={characterData:!1,attributes:!1,childList:!0,subtree:!1};new MutationObserver(mutate).observe(e,t)}};let target=document.querySelector("._2jwg div:not([data-pagelet]):not([class])")||document.querySelector('[role="feed"] > [id*="more_pager"]');switch(null!==target&&(_case=getCase(target)),_case){case 1:target=document.querySelector('[role="feed"] > [id*="more_pager"] > div:first-child');let e=document.querySelectorAll('[role="feed"] > ._4ikz');if(null!==e)for(let t=0;t<e.length;t++){let l=e[t].querySelector("video");null!==l&&l.addEventListener("loadstart",function(){addBtnSpeedToVideo(l)})}start_init(target);break;case 2:let t=setInterval(function(){if(""===(target=document.querySelector("._2jwg div:not([data-pagelet]):not([class])")).style.cssText){clearInterval(t);let e=target.querySelectorAll("[class][data-ft]");for(let t=0;t<e.length;t++){let l=e[t].getElementsByTagName("video")[0];void 0!==l&&"object"==typeof l&&setTimeout(function(){addBtnSpeedToVideo(l)},1e3)}start_init(target)}},1e3)}
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