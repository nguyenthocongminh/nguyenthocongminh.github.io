(function (){
    let backgroundNightColorHex = '#222';
    let textNightColorHex = '#eee';

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
    NightModeToolArea.style.position = 'absolute';
    NightModeToolArea.style.bottom = '25px';
    NightModeToolArea.style.right = '25px';
    let switchMode = document.createElement('label');
    switchMode.className = 'switch';
    NightModeToolArea.appendChild(switchMode);
    let input = document.createElement('input');
    input.type = 'checkbox';
    if (nightMode) {
        input.checked = true;
    }
    let spanSwitch = document.createElement('span');
    spanSwitch.className = 'slider round';
    switchMode.appendChild(input);
    switchMode.appendChild(spanSwitch);
})();