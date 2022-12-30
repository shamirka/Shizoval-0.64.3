import wsHook from '../../Shared/wsHook.js';
import { packetControl } from '../../index.js';

export default class PacketControl {
    packetCounter = 0;
    lastResponseTime = new Date().getTime();
    get responseTime() {
        return new Date().getTime() - this.lastResponseTime;
    }
}

setInterval(() => {
    const output = document.getElementsByClassName('sc-bwzfXH iCDncT')[0];

    if (!output || output.childElementCount < 2)
        return;

    if (output.childElementCount === 2) {
        const pps = document.createElement('div');
        pps.innerHTML = '<div class="sc-bwzfXH cmInNa" data-style="BattleHudFpsComponentStyle-row"><span class="sc-bxivhb fPSAir" data-style="BattleHudFpsComponentStyle-label">PPS: </span><span class="sc-bxivhb bcGHtx" data-style="BattleHudFpsComponentStyle-value" id="pps">0</span></div>';
        output.appendChild(pps);
    }

    const pps = document.getElementById('pps'),
        counter = packetControl.packetCounter;

    counter <= 10 && (pps.style.color = 'rgb(14, 157, 240)'); // отлично
    counter > 10 && counter < 30 && (pps.style.color = 'rgb(116, 186, 61)'); // так себе
    counter >= 30 && counter <= 70 && (pps.style.color = 'rgb(255, 188, 9)'); // хуево
    counter > 70 && (pps.style.color = 'rgb(255, 82, 9)'); // все пизда

    pps.textContent = counter.toString();
    
    packetControl.packetCounter = 0;
}, 1000);

wsHook.before = function() {
    packetControl.packetCounter++;
}

wsHook.after = function (e, url, wsObject) {
    if (packetControl.responseTime < 5)
        return e;

    packetControl.lastResponseTime = new Date().getTime();
    return e;
}