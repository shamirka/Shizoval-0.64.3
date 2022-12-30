import { utils } from '../index.js';

const __filename = 'src/Game/gameObjects.js';

export default class GameObjects {
    #root;
    #world;
    #gameMode;
    #localTank;

    get root() {
        if (this.#root)
            return this.#root;

        const root = document.getElementById('root');

        if (!root)
            return utils.debug(__filename, 17, 'GameObjects::get root', 'root (expected HTMLElement) invalid');

        return this.#root = root._reactRootContainer?._internalRoot?.current?.memoizedState?.
            element?.type?.prototype?.store;
    }

    get world() {
        if (this.#world)
            return this.#world;

        return this.#world = utils.getComponentNames(this.root?.subscribers?.toArray())?.
            ['ChassisSettingsUpdater']?.tank?.world;
    }

    get gameMode() {
        if (this.#gameMode && utils.isArrayValid(this.#gameMode['originalArray']))
            return this.#gameMode;

        return this.#gameMode = utils.getComponentNames(this.world?.entities_0?.
            toArray()?.at(0)?.components_0?.array);
    }

    get localTank() {
        if (this.#localTank && utils.isArrayValid(this.#localTank['originalArray']))
            return this.#localTank;

        if (!this.gameMode)
            return;

        let possesedTank = this.gameMode['originalArray'][0]?.gameMode_0?.possesedTank;

        if (!possesedTank)
            return utils.debug(__filename, 46, 'GameObjects::get localtank', 'possedTank (expected BattleEntity) invalid');

        this.#localTank = utils.getComponentNames(possesedTank.components_0?.array);

        if (this.#localTank)
            this.#localTank['entity'] = possesedTank;

        return this.#localTank;
    }

    reset = () => {
        this.#gameMode = undefined;
        this.#localTank = undefined;
        this.#world = undefined;
    }
}