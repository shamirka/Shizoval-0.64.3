import { config, utils, sync, gameObjects, packetControl } from '../../../index.js';

const __filename = 'src/Game/features/cheats/sync.js';

export default class Sync {
    #initialized = false;
    #nextTime = 0;
    #aafk = undefined;
    #config = config.data.syncData;
    lastSendState = {
        position: {
            x: 0, y: 0, z: 0
        },
        orientation: {
            x: 0, y: 0, z: 0, w: 0
        }
    };
    skip = false;
    forceSkip = false;
    isRandomTPEnabled = false;

    reset = () => {
        this.forceSkip = false;
        this.skip = false;
        this.#initialized = false;
        this.#nextTime = 0;
        clearInterval(this.#aafk);
    }

    isRocketsExist = onlyEnemy => {
        let tanks = utils.getTanks(onlyEnemy),
            state = false;

        if (!utils.isArrayValid(tanks))
            return;

        for (const tank of tanks) {
            let shells = tank['StrikerRocketFactory']?.shellCache_0?.itemsInUse?.toArray();

            if (utils.isArrayValid(shells)) {
                for (const shell of shells) {
                    utils.match(shell.components_0.array[1].direction, 'init_')?.[0](0, 0, 0);
                }

                state = true;
            }
        }

        return state;
    }

    randomPosition = t => {
        sync.isRandomTPEnabled = true;

        let map = gameObjects.gameMode?.['BattleMapComponent'],
            killZone = utils.getKillZone(map);

        if (killZone) {
            t.position.x = utils.getUniqueRandomArbitrary(this.lastSendState.position.x, 3000,
                killZone.minX, killZone.maxX);
            t.position.y = utils.getUniqueRandomArbitrary(this.lastSendState.position.y, 3000, 
                killZone.minY, killZone.maxY);
            t.position.z = !Math.round(Math.random()) ? map.bounds.maxZ + 500 : killZone.maxZ;

            t.orientation.x = 0;
            t.orientation.y = 0;
        }
    }

    compareDistance = position => {
        if (this.skip || this.forceSkip)
            return false;

        return utils.match(position, 'distance_')?.(this.lastSendState.position) < 300;
    }

    sendUpdate = (sender, state) => {
        if (packetControl.responseTime >= 2000)
            return;

        const tankState = gameObjects.localTank?.['TankComponent']?.state?.name;

        if (tankState !== 'ACTIVE')
            return;

        const result = utils.isNotKillZone(state.position);

        if (result !== 0)
            utils.outKillZone(state.position, result);

        if (gameObjects.localTank['StrikerWeapon'] && this.compareDistance(state.position))
            return;

        this.lastSendState.position = state.position.clone();
        this.lastSendState.orientation = state.orientation.clone();

        state.velocity.init_y2kzbl$(0, 0, 0);
        state.angularVelocity.init_y2kzbl$(0, 0, 0);
    
        sender.sendUpdate_0(state, sender.world.physicsTime);
    }

    process = (sender, chassisServer, root, turretServer) => {
        utils.isBindPressed(this.#config.antiStrikerData) && 
            (this.#config.antiStrikerData.state = !this.#config.antiStrikerData.state);

        utils.isBindPressed(this.#config.randomTeleportData) && 
            (this.#config.randomTeleportData.state = !this.#config.randomTeleportData.state);

        utils.isBindPressed(this.#config.antiMineData) && 
            (this.#config.antiMineData.state = !this.#config.antiMineData.state);

        if (sender && this.#initialized && !this.skip && !this.forceSkip && sender.world.physicsTime > this.#nextTime) {
            this.#nextTime = sender.world.physicsTime + this.#config.updateInterval;
            sender.sendState_0(sender.tankPhysicsComponent_0.getInterpolatedBodyState());
        }

        if (this.#initialized)
            return;

        if (!sender || !chassisServer)
            return utils.debug(__filename, 122, 'Sync::process', 'sender (expected LocalTankStateServerSenderComponent) invalid');

        if (!gameObjects.localTank['StrikerWeapon'] && turretServer) {
            turretServer.sendUpdate_0 = function () {
                this.saveTurretState_0();

                if (this.lastSentState_0.controlType.name !== 'TARGET_ANGLE_WORLD')
                    return;
    
                if (this.lastDirection && +this.lastDirection.toFixed(2) === +this.lastSentState_0.controlInput.toFixed(2))
                    return;

                if (this.nextTime && sender.world.physicsTime < this.nextTime) 
                    return;

                this.lastDirection = this.lastSentState_0.controlInput;
                this.nextTime = sender.world.physicsTime + 200;
                this.serverInterface_0.update_79f0ox$(this.world.physicsTime, this.tankComponent_0.incarnationId,
                    this.lastSentState_0);
            }
        }

        this.#initialized = true;

        setInterval((function() {
            root.state.battlePauseState.idleKickPeriodInMsec.low_ = 12000000;
            const sendChassisControl = utils.match(this.serverInterface_0, 'sendChassisControl_');

            if (!sendChassisControl)
                return utils.debug(__filename, 131, 'Sync::process::interval:126', 'sendChassisControl (expected function) invalid');

            this.onControlChanged_0 = () => {};

            this.chassis_0.controlState.moveForward = 1, sendChassisControl(this.world.physicsTime, this.chassis_0.controlState);
            this.chassis_0.controlState.moveForward = 0, sendChassisControl(this.world.physicsTime, this.chassis_0.controlState);
        }).bind(chassisServer), 30000);

        sender.__proto__.sendState_0 = function(t) {
            if (sync.forceSkip)
                return;

            if (sync.skip)
                return sync.sendUpdate(this, t);

            sync.#config.antiMineData.state && (t.position.z += sync.#config.antiMineData.height);

            sync.isRandomTPEnabled = false;

            if (sync.#config.antiStrikerData.state)
                sync.isRocketsExist(sync.#config.antiStrikerData.type === 'Enemy') && sync.randomPosition(t);

            sync.#config.randomTeleportData.state && sync.randomPosition(t);

            sync.sendUpdate(this, t);
        }
    }
}