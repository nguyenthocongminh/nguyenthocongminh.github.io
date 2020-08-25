(function (){
    let nightMode = false;
    if (localStorage.nightMode && localStorage.nightMode === true) {
        nightMode = true;
    }

    let fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.type = 'text/css';
    fontAwesome.media = 'all';
    fontAwesome.href = 'https://nguyenthocongminh.github.io/css/all.css';
    document.head.appendChild(fontAwesome);

    let NightModeToolArea = document.createElement('div');
    NightModeToolArea.className = 'night-mode-switch';
    NightModeToolArea.style.position = 'fixed';
    NightModeToolArea.style.bottom = '25px';
    NightModeToolArea.style.right = '25px';
    document.body.appendChild(NightModeToolArea);
    let switchMode = document.createElement('label');
    switchMode.className = 'switch';
    NightModeToolArea.appendChild(switchMode);
    let input = document.createElement('input');
    input.type = 'checkbox';
    if (nightMode) {
        input.checked = true;
    }
    let spanSwitch = document.createElement('span');
    spanSwitch.className = 'fa slider round';
    switchMode.appendChild(input);
    switchMode.appendChild(spanSwitch);

    const nightModeChange = function (mode) {
        if (mode) {
            document.body.classList.add('night-mode');
            localStorage.nightMode = true;
        } else {
            document.body.classList.remove('night-mode');
            localStorage.nightMode = false;
        }
    }

    if (nightMode) {
        nightModeChange(true);
    }

    input.addEventListener('change', function () {
        nightModeChange(this.checked);
    })
})();