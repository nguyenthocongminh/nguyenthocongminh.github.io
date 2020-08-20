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
            let _case = 0;

            function getCase(target) {
                if (target.id.indexOf('more_pager') !== -1) {
                    return 1;
                }
                return 2;
            }

            function addBtnSpeedToVideo(video) {
                let control_area_focus = video.parentNode
                    .querySelector('._170l._27db')
                    .querySelector('._1otk._3t1r._4ubd')
                    .querySelectorAll('._1c7f')[2];
                let btn_focus = control_area_focus.querySelector('._2j04');
                if (btn_focus === null) {
                    return;
                }
                let new_btn = document.createElement('div');
                new_btn.className = '_2j04';
                let new_btn_content_direct = document.createElement('div');
                new_btn_content_direct.setAttribute('data-tooltip-content', 'Tốc độ');
                new_btn_content_direct.setAttribute('data-hover', 'tooltip');
                new_btn_content_direct.setAttribute('data-tooltip-position', 'above');
                let button = document.createElement('button');
                button.className = '_zbd _42ft';
                button.setAttribute('tabindex', '0');
                button.setAttribute('type', 'button');
                let button_content = document.createElement('i');
                button_content.className = 'fa fa-bolt _rwt';
                button_content.style.width = '20px';
                button_content.style.height = '20px';
                button_content.style.display = 'inline-block';
                button_content.style.color = 'white';
                button_content.style.fontSize = '20px';
                new_btn.appendChild(new_btn_content_direct);
                new_btn_content_direct.appendChild(button);
                button.appendChild(button_content);
                control_area_focus.insertBefore(new_btn, btn_focus.nextSibling);
                new_btn.onclick = function (/* e */) {
                    let previous = this.previousSibling;
                    if (this.querySelector('._2iw7._2iw8') === null) {
                        if (previous.querySelector('._2iw7._2iw8') !== null) {
                            previous.querySelector('[data-tooltip-content]').click();
                        }
                        let tool = document.createElement('div');
                        tool.setAttribute('class', '_2iw7 _2iw8');
                        this.prepend(tool);
                        let _2i_w = document.createElement('div');
                        _2i_w.setAttribute('class', '_2i_w');
                        tool.appendChild(_2i_w);
                        let _2i_x = document.createElement('div');
                        _2i_x.setAttribute('class', '_2i_x');
                        let _2j03 = document.createElement('div');
                        _2j03.setAttribute('class', '_2j03');
                        _2i_w.appendChild(_2i_x);
                        _2i_w.appendChild(_2j03);

                        let playbackRate = video.playbackRate;
                        if (allowPlaybackRate.indexOf(playbackRate) === -1) {
                            playbackRate = null;
                        }
                        let _4t9q = document.createElement('div');
                        _4t9q.setAttribute('class', '_4t9q');
                        _4t9q.innerText = "Tốc độ";
                        _2i_x.appendChild(_4t9q);
                        let _4t9z = document.createElement('div');
                        _4t9z.setAttribute('class', '_4t9z speed-controller');
                        _4t9z.setAttribute('role', 'radiogroup');
                        _2i_x.appendChild(_4t9z);
                        for (let i = 0; i < allowPlaybackRate.length; i++) {
                            let option = document.createElement('a');
                            let select = ((playbackRate === allowPlaybackRate[i])?'true':'false');
                            option.setAttribute('class', '_2iw4');
                            option.setAttribute('href', 'javascript:void(0);');
                            option.setAttribute('tabindex', '0');
                            option.setAttribute('aria-checked', select);
                            option.setAttribute('role', 'radio');
                            option.setAttribute('aria-disabled', 'false');
                            _4t9z.appendChild(option);
                            let _4t7u = document.createElement('div');
                            _4t7u.setAttribute('class', '_4t7u');
                            option.appendChild(_4t7u);
                            if (playbackRate === allowPlaybackRate[i]) {
                                let _4t7r = document.createElement('div');
                                _4t7r.setAttribute('class', '_4t7r');
                                _4t7u.appendChild(_4t7r);
                            }
                            let _2iw5 = document.createElement('div');
                            _2iw5.setAttribute('class', '_2iw5');
                            _2iw5.innerText = allowPlaybackRate[i] + 'x';
                            option.appendChild(_2iw5);
                            js_helper_lib.addEvent(option, 'click', function (e) {
                                e.stopPropagation();
                                video.playbackRate = allowPlaybackRate[i];
                            })
                        }
                    } else {
                        this.querySelector('._2iw7._2iw8').remove();
                    }
                };
                js_helper_lib.addEvent(new_btn.previousSibling.querySelector('[data-tooltip-content]'), 'click', function () {
                    if (new_btn.querySelector('._2iw7._2iw8') !== null) {
                        new_btn.querySelector('._2iw7._2iw8').remove();
                    }
                });

                js_helper_lib.addEvent(video, 'ratechange', function () {
                    let radio_group = this.parentNode.querySelector('.speed-controller');
                    if (radio_group !== null) {
                        let playbackRate = this.playbackRate;
                        let cur_check = radio_group.querySelector('._4t7r');
                        if (cur_check !== null) {
                            cur_check.remove();
                        }
                        let list = radio_group.querySelectorAll('a');
                        for (let i = 0; i < list.length; i++) {
                            if (playbackRate === allowPlaybackRate[i]) {
                                list[i].setAttribute('aria-checked', 'true');
                                let checkbox = list[i].querySelector('._4t7u');
                                let check_dot = document.createElement('div');
                                check_dot.setAttribute('class', '_4t7r');
                                checkbox.appendChild(check_dot);
                            } else {
                                list[i].setAttribute('aria-checked', 'false');
                            }
                        }
                    }
                })
            }

            function mutate(mutations) {
                mutations.forEach(function(mutation) {
                    let node = mutation.addedNodes[0];
                    switch(_case) {
                        case 1:
                            setTimeout(function (/* e */) {
                                node = mutation.addedNodes[0];
                                if (node !== null) {
                                    let video = node.querySelectorAll('video');
                                    if (video.length > 0) {
                                        for (let i = 0; i < video.length; i++) {
                                            addBtnSpeedToVideo(video[i]);
                                        }
                                    }
                                }
                            }, 1000);
                            break;
                        case 2:
                            let video = node.getElementsByTagName('video')[0];
                            if (video !== undefined && typeof video === 'object') {
                                video.addEventListener('loadstart', function (/* e */) {
                                    addBtnSpeedToVideo(video);
                                });
                            }
                            break;
                        default:
                        // code block
                    }
                });
            }

            function start_init(target) {
                if (arguments.length === 1) {
                    let observer = new MutationObserver( mutate );
                    let config = { characterData: false, attributes: false, childList: true, subtree: false };

                    observer.observe(target, config);
                }
            }

            let target = document.querySelector('._2jwg div:not([data-pagelet]):not([class])') ||
                         document.querySelector('[role="feed"] > [id*="more_pager"]');
            if (target !== null) {
                _case = getCase(target);
            }

            switch(_case) {
                case 1:
                    target = document.querySelector('[role="feed"] > [id*="more_pager"] > div:first-child');
                    let first = document.querySelectorAll('[role="feed"] > ._4ikz');
                    if (first !== null) {
                        for (let i = 0; i < first.length; i++) {
                            let video = first[i].querySelector('video');
                            if (video !== null) {
                                video.addEventListener('loadstart', function (/* e */) {
                                    addBtnSpeedToVideo(video);
                                });
                            }
                        }
                    }
                    start_init(target);
                    break;
                case 2:
                    let loop = setInterval(function (/* e */) {
                        target = document.querySelector('._2jwg div:not([data-pagelet]):not([class])');
                        if (target.style.cssText === "") {
                            clearInterval(loop);
                            let first_nodes = target.querySelectorAll('[class][data-ft]');
                            for (let i = 0; i < first_nodes.length; i++) {
                                let video = first_nodes[i].getElementsByTagName('video')[0];
                                if (video !== undefined && typeof video === 'object') {
                                    setTimeout(function () {
                                        addBtnSpeedToVideo(video);
                                    }, 1000);
                                }
                            }
                            start_init(target);
                        }
                    }, 1000);
                    break;
                default:
                // code block
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