import { config, utils, packetControl, gameObjects } from '../../../index.js';

export default class Clicker {
    #config = config.data.clickerData;
    #supplies;
    temp = false;

    constructor() {
        setInterval(this.suppliesLowPriority, 300);
        setInterval(this.suppliesHighPriority, 0);
    }

    reset = () => {
        this.temp = false;
        this.#supplies = undefined;
    }

    getSupplyByName = name => {
        return this.#supplies.get_11rb$(this.#supplies.head_1lr44l$_0?.key.constructor[name]);
    }

    activateSupply = (name, low, time = 30) => {
        if (low) {
            let actions = Array.from(gameObjects.world?.inputManager?.input?.gameActions_0?.map);

            if (!utils.isArrayValid(actions))
                return;

            for (const action of actions) {
                if (action[0].name === name) {
                    action[1].wasPressed = true;
                    action[1].wasReleased = true;
                    return;
                }
            }
        }

        const tankState = gameObjects.localTank?.['TankComponent']?.state;

        if (tankState?.name === 'ACTIVE' && packetControl.responseTime <= time)
            this.getSupplyByName(name)?.onUserActivatedSupply();
    }

    suppliesHighPriority = () => {
        if (!this.#supplies)
            return;

        if (this.#config.autoHealingData.state || this.temp !== false) {
            for (let i = 0; i < this.#config.autoHealingData.multiply; i++) {
                this.activateSupply('FIRST_AID', false, this.#config.autoHealingData.delay);
            }
        }

        if (this.#config.autoMiningData.state || this.temp !== false) {
            for (let i = 0; i < this.#config.autoMiningData.multiply; i++) {
                this.activateSupply('MINE', false, this.#config.autoMiningData.delay);
            }
        }
    };

    suppliesLowPriority = () => {
        if (!this.#supplies)
            return;

        if (this.#config.autoArmorData.state)
            this.activateSupply('USE_DOUBLE_ARMOR', true);

        if (this.#config.autoDamageData.state)
            this.activateSupply('USE_DOUBLE_DAMAGE', true);

        if (this.#config.autoNitroData.state)
            this.activateSupply('USE_NITRO', true);
    };

    process = supplies => {
        utils.isBindPressed(this.#config.autoHealingData) && 
            (this.#config.autoHealingData.state = !this.#config.autoHealingData.state);

        utils.isBindPressed(this.#config.autoArmorData) && 
            (this.#config.autoArmorData.state = !this.#config.autoArmorData.state);

        utils.isBindPressed(this.#config.autoDamageData) && 
            (this.#config.autoDamageData.state = !this.#config.autoDamageData.state);

        utils.isBindPressed(this.#config.autoNitroData) && 
            (this.#config.autoNitroData.state = !this.#config.autoNitroData.state);

        utils.isBindPressed(this.#config.autoMiningData) && 
            (this.#config.autoMiningData.state = !this.#config.autoMiningData.state);

        supplies && (this.#supplies = supplies);
    }
}