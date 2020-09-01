let _case = 0;

const getCase = function (target) {
    if (target.id.indexOf('more_pager') !== -1) {
        return 1;
    }
    return 2;
};

const addBtnSpeedToVideo = function (video) {
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
                let select = ((playbackRate === allowPlaybackRate[i]) ? 'true' : 'false');
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
};

const mutate = function (mutations) {
    mutations.forEach(function (mutation) {
        let node = mutation.addedNodes[0];
        switch (_case) {
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
};

const start_init = function (target) {
    if (arguments.length === 1) {
        let observer = new MutationObserver(mutate);
        let config = {characterData: false, attributes: false, childList: true, subtree: false};

        observer.observe(target, config);
    }
};

let target = document.querySelector('._2jwg div:not([data-pagelet]):not([class])') ||
    document.querySelector('[role="feed"] > [id*="more_pager"]');
if (target !== null) {
    _case = getCase(target);
}

switch (_case) {
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