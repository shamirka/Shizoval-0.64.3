import { KillZonesFlags } from '../../../Shared/utils.js';
import { utils, config } from '../../../index.js';

const __filename = 'src/Game/features/cheats/airBreak.js';

export default class AirBreak {
    #config = config.data.airBreakData;
    #state = false;
    #position = { x: 0, y: 0, z: 0 };
    #initialized = false;

    get state() {
        return this.#state;
    }

    clearVelocity = body => {
        const velocityInit = utils.match(body.state.velocity, 'init_')?.[0],
            angularVelocityInit = utils.match(body.state.angularVelocity, 'init_')?.[0];

        if (typeof velocityInit !== 'function' || typeof angularVelocityInit !== 'function')
            return utils.debug(__filename, 20, 'AirBreak::clearVelocity', `velocityInit (expected function, type: ${typeof velocityInit}) or angularVelocityInit (expected function, type ${typeof angularVelocityInit}) invalid`);
        
        velocityInit(), angularVelocityInit();
    }

    setAirBreakPosition = position => {
        if (this.#config.killZoneData.state) {
            let result = utils.isNotKillZone(position);
            if (result !== KillZonesFlags.None)
                utils.outKillZone(position, result);
        }

        position.x && position.x !== 0 && (this.#position.x = position.x);
        position.y && position.y !== 0 && (this.#position.y = position.y);
        position.z && position.z !== 0 && (this.#position.z = position.z);
    }

    onAirBreakActivated = physics => {
        this.setAirBreakPosition(physics.body.state.position);
    }

    onAirBreakDeactivated = physics => {
        this.clearVelocity(physics.body);
        physics.body.movable = true;
    }

    toggleState = physics => {
        (this.#state = !this.#state) ? this.onAirBreakActivated(physics) : this.onAirBreakDeactivated(physics);
    }

    setRayLenght = (chassis, value) => {
        if (!chassis)
            return utils.debug(__filename, 52, 'AirBreak::setRayLenght', 'chassis (expected TrackedChassis) invalid'); 

        chassis.params_0.maxRayLength = value;
    }

    align = (body, camera) => {
        switch (camera) {
            case 'noob':
                body.state.velocity.init_y2kzbl$(0, 0, 0);
                body.state.angularVelocity.init_y2kzbl$(0, 0, 0);
                body.state.orientation.fromEulerAngles_y2kzbl$(0, this.#config.flip ? Math.PI : 0, 0);
                break;

            case 0:
                body.state.velocity.z = 0;
                body.state.angularVelocity.x = 0;
                body.state.angularVelocity.y = 0;
                body.state.orientation.x = 0;
                body.state.orientation.y = 0;
            break;

            default:
                body.state.velocity.init_y2kzbl$(0, 0, 0);
                body.state.angularVelocity.init_y2kzbl$(0, 0, 0);
                body.state.orientation.fromEulerAngles_y2kzbl$(this.#config.tilt ? 
                    this.#config.flip ? camera.pathPosition : -camera.pathPosition : 0, 
                    this.#config.flip ? Math.PI : 0, camera.currState_0.direction);
                break;
        }
    }

    alignTank = (physics, camera) => {
        switch (this.#config.typeData.state) {
            case 'airWalk':
                this.align(physics.body, 0);
                break;
            case 'default':
                this.align(physics.body, camera);
                break;
            case 'noob':
                this.align(physics.body, 'noob');
        }
    }

    setSmoothPosition = (currPos, setPos, smooth) => {
        if (this.#config.typeData.state === 'default' || this.#config.typeData.state === 'noob') {
            currPos.x += (setPos.x - currPos.x) / smooth;
            currPos.y += (setPos.y - currPos.y) / smooth;
        }

        currPos.z += (setPos.z - currPos.z) / smooth;
    }

    setPosition = physics => {
        this.setSmoothPosition(physics.body.state.position, this.#position, 
            this.#config.smoothData.state);
    }

    getSpeed = type => {
        switch (type) {
            case 'forward':
            case 'right':
            case 'up':
                return this.#config.speedData.state;

            default:
                return -this.#config.speedData.state;
        }
    }

    getRadian = (type, direction) => {
        switch (type) {
            case 'forward':
            case 'back':
                return -direction;

            case 'left':
            case 'right':
                return -(direction - Math.PI / 2);
        }

        return 0;
    }

    onMoved = (type, direction = 0) => {
        let speed       = this.getSpeed(type),
        radian          = this.getRadian(type, direction),
        position        = { x: 0, y: 0, z: 0 };

        switch (type) {
            case 'forward':
            case 'back':
            case 'left':
            case 'right':
                switch (this.#config.typeData.state) {
                    case 'default':
                        position.x = this.#position.x + speed * Math.sin(radian);
                        position.y = this.#position.y + speed * Math.cos(radian);
                        break;
                    
                    case 'noob':
                        if (type === 'left' || type === 'right')
                            position.x = this.#position.x + speed;

                        if (type === 'forward' || type === 'back')
                            position.y = this.#position.y + speed;
                }
                break;

            default:
                position.z = this.#position.z + speed;
        }

        this.setAirBreakPosition(position);
    }

    keyHandler = direction => {
        let config;

        config = this.#config.speedData;
        if (utils.isBindPressed(config.inc)) {
            config.state += 10;

            if (config.state > 1000) config.state = 1000;
        }

        if (utils.isBindPressed(config.dec)) {
            config.state -= 10;

            if (config.state < 10) config.state = 10;
        }

        config = this.#config.smoothData;
        if (utils.isBindPressed(config.inc)) {
            config.state += 1;

            if (config.state > 100) config.state = 100;
        }

        if (utils.isBindPressed(config.dec)) {
            config.state -= 1;

            if (config.state < 1) config.state = 1;
        }

        config = this.#config.killZoneData;
        utils.isBindPressed(config) && (config.state = !config.state);

        config = this.#config.typeData;
        utils.isBindPressed(config.default) && (config.state = 'default');
        utils.isBindPressed(config.simple) && (config.state = 'noob');
        utils.isBindPressed(config.airWalk) && (config.state = 'airWalk');

        config = this.#config.movementData;
        switch (this.#config.typeData.state) {
            case 'noob':
                utils.isBindPressed(config.up)        && this.onMoved('up');
                utils.isBindPressed(config.down)      && this.onMoved('down');
                utils.isBindPressed(config.forward)   && this.onMoved('forward');
                utils.isBindPressed(config.back)      && this.onMoved('back');
                utils.isBindPressed(config.left)      && this.onMoved('left');
                utils.isBindPressed(config.right)     && this.onMoved('right');
                break;

            case 'default':
                utils.isBindPressed(config.forward)   && this.onMoved('forward', direction);
                utils.isBindPressed(config.back)      && this.onMoved('back', direction);
                utils.isBindPressed(config.left)      && this.onMoved('left', direction);
                utils.isBindPressed(config.right)     && this.onMoved('right', direction);

            case 'airWalk':
                utils.isBindPressed(config.up)        && this.onMoved('up');
                utils.isBindPressed(config.down)      && this.onMoved('down');
        };
    }

    reset = () => {
        this.#state = false;
        this.#initialized = false;
    }

    process = (physics, camera, chassis, sender) => {
        if (this.#initialized)
            return;

        if (!physics || !camera)
            return utils.debug(__filename, 235, 'AirBreak::process', `physics (expected TankPhysicsComponent, type: ${typeof physics}) or camera (expected FollowCamera, type: ${typeof camera}) invalid`);

        this.#initialized = true;

        const runAfterPhysicsUpdate = utils.match(sender, 'runAfterPhysicsUpdate_', 'function', true);

        runAfterPhysicsUpdate ? sender[runAfterPhysicsUpdate] = () => {
            utils.isBindPressed(this.#config.toggleStateData) && this.toggleState(physics);

            if (this.#state !== true) return this.setRayLenght(chassis, 50);
        
            this.keyHandler(camera.currState_0.direction),
            this.alignTank(physics, camera), 
            this.setPosition(physics), 
            physics.body.movable = (this.#config.typeData.state === 'airWalk'),
            this.#config.typeData.state === 'airWalk' && this.setRayLenght(chassis, 1e+100);
        } : utils.debug(__filename, 240, 'AirBreak::process', 'runAfterPhysicsUpdate (expected string) invalid');
    };
}