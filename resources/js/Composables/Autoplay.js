import { theories } from '@/Composables/Theories.js';

export function autoplay() {
    var width;
    var height;
    var mines;
    var remain;

    const PANELS_ID = "#mine-detector-panels";
    const CLASS_HIDDEN = "hide";
    const CLASS_OPENED = "opened";
    const CLASS_FLAGGED = "flag";
    const CLASS_OPENED_ENOUGH = "opened-enough";
    const rotateArray90Deg = a => a[0].map((_, c) => a.map(r => r[c])).reverse();

    playAutomatically();

    function playAutomatically() {
        console.log('autoplay: start');
        if (isGameOver()) {
            console.log('autoplay: Woops! Game Over!');
            return;
        }
        /*
        if (!isStarted()) {
            console.log('autoplay: click random panel');
            clickRandomPanel();
            if (isGameOver()) {
                console.log('autoplay: OMG! Game Over!');
                return;
            }
        }
        */
        let resultOfFlags = setFlagsAutomatically();
        let resultOfPanles = revealPanelsAutomatically();
        if (!resultOfFlags && !resultOfPanles) {
            console.log('autoplay: stalemated');
            clickRandomPanel();
        }
        if (!isGameOver()) {
            setTimeout(() => { clickAutoplayButton(); }, 500);
        }
    }

    function getStatus () {
        width = parseInt(document.getElementById('fieldWidthInput').value, 10);
        height = parseInt(document.getElementById('fieldHeightInput').value, 10)    
        mines = parseInt(document.getElementById('minesCountInput').value, 10);
        remain = parseInt(document.getElementById('remain').textContent, 10);
    }

    function clickRandomPanel() {
        console.log("autoplay: click AUTOPLAY button");
        selectRandomPanel().click();
    }

    function selectRandomPanel() {
        let el;
        while (1) {
            let x = Math.floor( Math.random() * width ) + 1;
            let y = Math.floor( Math.random() * height ) + 1;
            console.log('clickRandomPanel:('+x+', '+y+')');
            let selector = PANELS_ID + " tr:nth-child("+y+") td:nth-child("+x+")";
            el = document.querySelector(selector);
            if (el.classList.contains(CLASS_HIDDEN) && !el.classList.contains(CLASS_FLAGGED)) {
                return el;
            }
        }
    }

    function clickAutoplayButton() {
        let button = document.getElementById('autoplay-button');
        if (button !== null) {
            button.click();
        }
    }

    function isStarted() {
        getStatus();
        return remain < width * height;
    }

    function isCleared() {
        getStatus();
        return mines === remain;
    }

    function isGameOver() {
        return document.querySelector(
            PANELS_ID + " td.red[v='-1']"
        ) !== null || isCleared();
    }

    function isFlaggable(element) {
        let v = parseInt(element.getAttribute('v'), 10);
        return v === countUnrevealedAround(element)
            && countFlagsAround(element) < v;
    }

    function isFlaggedEnough(panel) {
        let v = parseInt(panel.getAttribute('v'), 10);
        return v === 0 || v === countFlagsAround(panel);
    }

    function isInRange(x, y) {
        return x >= 1
            && x <= width
            && y >= 1
            && y <= height
    }

    function getPanelByXY(x, y) {
        return document.querySelector(
            PANELS_ID + " td[x='" + x + "'][y='" + y + "']"
        );
    }

    function getX(element) {
        return parseInt(element.getAttribute('x'), 10);
    }

    function getY(element) {
        return parseInt(element.getAttribute('y'), 10);
    }

    function countUnrevealedAround(element) {
        let c = 0;
        let x = getX(element);
        let y = getY(element);
        for (let j = -1; j <= 1; j++) {
            let ty = y + j;
            for (let i = -1; i <= 1; i++) {
                let tx = x + i;
                if (isInRange(tx, ty)) {
                    let target = getPanelByXY(tx, ty);
                    if (target === null) {
                        continue;
                    }
                    if (target.classList.contains(CLASS_HIDDEN)) {
                        c++;
                    }
                }
            }
        }
        return c;
    }

    function countFlagsAround(element) {
        let c = 0;
        let x = getX(element);
        let y = getY(element);
        for (let j = -1; j <= 1; j++) {
            let ty = y + j;
            for (let i = -1; i <= 1; i++) {
                let tx = x + i;
                if (isInRange(tx, ty)) {
                    var target = getPanelByXY(tx, ty);
                    if (target === null) {
                        continue;
                    }
                    if (target.classList.contains(CLASS_FLAGGED)) {
                        c++;
                    }
                }
            }
        }
        return c;
    }

    function setFlagsAutomatically() {
        let result = false;
        let selector = PANELS_ID + ' td.' + CLASS_OPENED;
        console.log("setFlagsAutomatically:selector:" + selector);
        const panels = document.querySelectorAll(selector);
        console.log(panels);
        console.log("setFlagsAutomatically:panels.length:" + panels.length);
        for (let i = 0; i < panels.length; i++) {
            let panel = panels[i];
            console.log("isFlaggable:" + isFlaggable(panel));
            if (isFlaggable(panel)) {
                console.log("setFlagsAutomatically:flaggable:true");
                result = true;
                setFlagsAround(panel);
            }
            /*
            if (flagIfMatchTheories(panel)) {
                result = true;
            }
            */
        }
        console.log("setFlagsAutomatically:" + result);
        return result;
    }

    function setFlagsAround(element) {
        let panels = getPanels2Flag(element);
        for (let i = 0; i < panels.length; i++) {
            setAFlag(panels[i]);
        }
    }

    function getPanels2Flag(element) {
        let panels = [];
        let x = getX(element);
        let y = getY(element);
        for (let j = -1; j <= 1; j++) {
            let ty = y + j;
            for (let i = -1; i <= 1; i++) {
                let tx = x + i;
                if (isInRange(tx, ty)) {
                    let target = getPanelByXY(tx, ty);
                    if (
                        target.classList.contains(CLASS_HIDDEN)
                        && !target.classList.contains(CLASS_FLAGGED)
                    ) {
                        panels.push(target);
                    }
                }
            }
        }
        return panels;
    }

    function setAFlag(element) {
        element.classList.add(CLASS_FLAGGED);
        element.innerHTML = "🚩";
    }

    function revealPanelsAutomatically() {
        let result = false;
        let selector = PANELS_ID
            + " td." + CLASS_OPENED
            + ":not(." + CLASS_OPENED_ENOUGH + ")";
        let panels = document.querySelectorAll(selector);
            for (let i = 0; i < panels.length; i++) {
            let panel = panels[i];
            if (isRevealableAround(panel)) {
                result = true;
                revealPanelsAround(panel);
            }
            if (isRevealedEnough(panel)) {
                panel.classList.add(CLASS_OPENED_ENOUGH);
            }
        }
        console.log("revealPanelsAutomatically:" + result);
        return result;
    }

    function isRevealableAround(panel) {
        let v = parseInt(panel.getAttribute('v'), 10);
        return v > 0
            && v === countFlagsAround(panel)
            && v < countUnrevealedAround(panel);
    }

    function isRevealedEnough(panel) {
        let v = parseInt(panel.getAttribute('v'), 10);
        return v === 0
            || (isFlaggedEnough(panel) && v === countUnrevealedAround(panel));
    }

    function revealPanelsAround(panel) {
        let panels = getPanels2Reveal(panel);
        for (let i = 0; i < panels.length; i++) {
            panels[i].click();
        }
    }

    function getPanels2Reveal(panel) {
        let panels = [];
        let x = getX(panel);
        let y = getY(panel);
        for (let j = -1; j <= 1; j++) {
            let ty = y + j;
            for (let i = -1; i<= 1; i++) {
                let tx = x + i;
                if (isInRange(tx, ty)) {
                    let target = getPanelByXY(tx, ty);
                    if (
                        target.classList.contains(CLASS_HIDDEN)
                        && !target.classList.contains(CLASS_FLAGGED)
                    ) {
                        panels.push(target);
                    }
                }
            }
        }
        return panels;
    }

    function flagIfMatchTheories(panel) {
        for (let i = 0; i < theories.length; i++) {
            let theory = theories[i];
            let name = theory.name;
            let pattern = theory.pattern;
            let flags = theory.flags;

            flagIfMatchTheory(panel, {name: name, pattern: pattern, flags: flags});

            pattern = rotateArray90Deg(pattern);
            flags = rotateArray90Deg(flags);
            flagIfMatchTheory(panel, {name: name, pattern: pattern, flags: flags});

            pattern = rotateArray90Deg(pattern);
            flags = rotateArray90Deg(flags);
            flagIfMatchTheory(panel, {name: name, pattern: pattern, flags: flags});

            pattern = rotateArray90Deg(pattern);
            flags = rotateArray90Deg(flags);
            flagIfMatchTheory(panel, {name: name, pattern: pattern, flags: flags});
        }
    }

    function flagIfMatchTheory(panel, theory) {
        if (matchTheory(panel, theory)) {
            console.log('match theory: ' + theory.name);
            return flagAccordingToTheory(panel, theory);
        }
        return false;
    }

    function matchTheory(panel, theory) {
        let pattern = theory.pattern;
        let x = getX(panel);
        let y = getY(panel);
        const isHidden = panel => panel.classList.contains('hide');
        const isFlagged = panel => panel.classList.contains('flag');
        const isOpened = panel => panel.classList.contains('open');
        const getV = panel => parseInt(panel.getAttribute('v'), 10);
        let lenX = pattern[0].length;
        let lenY = pattern.length;
        if (!isInRange(x + lenX - 1, y + lenY - 1)) {
            return false;
        }
        for (let j = 0; j < lenY; j++) {
            let ty = y + j;
            for (let i = 0; i < lenX; i++) {
                let tx = x + i;
                let p = getPanelByXY(tx, ty);
                let v = getV(p);
                let t = pattern[j][i];
                if (t === 'h' && !isHidden(p) && !isFlagged(p)) {
                    return false;
                }
                if (t === 'o' && !isOpened(p)) {
                    return false;
                }
                if (t > 0 && t <= 8 && !isOpened(p) && t !== v) {
                    return false;
                }
            }
        }
        return true;
    }

    function flagAccordingToTheory(panel, theory) {
        console.log('flag according to theory: ' + theory.name);
        let flags = theory.flags;
        let x = getX(panel);
        let y = getY(panel);
        for (let j = 0; j < flags.length; j++) {
            let ty = y + j;
            for (let i = 0; i < flags[0].length; i++) {
                let tx = x + i;
                if (flags[j][i] == 1) {
                    setAFlag(getPanelByXY(tx, ty));
                }
            }
        }
    }
}
