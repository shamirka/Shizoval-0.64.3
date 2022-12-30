import { config, airBreak, utils, cameraHack } from '../../../index.js';

const __filename = 'src/Game/features/cheats/camera.js';

export default class Camera {
    #distance = 1500;
    #index = 0;
    #initialized = false;
    #spectateBody;
    #mousemoveEvent = false;
    #camera;
    #config = config.data.cameraData;

    reset = () => {
        this.#initialized = false;
        this.#spectateBody = undefined;
        this.#camera = undefined;
    }

    spectate = targetId => {
        this.#spectateBody = targetId;
    }

    deactivate = () => {
        this.#spectateBody = undefined;
    }

    distance = () => {
        if (!this.#config.state)
            return;

        this.#distance += 1000, this.#distance > 2500 && (this.#distance = 500);
    }

    nextTarget = () => {
        let tanks = utils.getTanks();

        if (!utils.isArrayValid(tanks))
            return;

        if (this.#index >= tanks.length) 
            this.#index = 0;
        
        this.#spectateBody = tanks[this.#index];
        this.#index++;
    }

    process = (camera, controller) => {
        let spectateConfig = config.data.spectateData;

        utils.isBindPressed(this.#config) && this.distance();
        utils.isBindPressed(spectateConfig.deactivateData) && this.deactivate();
        utils.isBindPressed(spectateConfig.nextTargetData) && this.nextTarget();

        if (this.#initialized)
            return;

        if (!camera || !controller)
            return utils.debug(__filename, 58, 'Camera::process', `controller (expected FollowCameraHeightController, type: ${typeof controller}) or camera (expected FollowCamera, type: ${typeof camera}) invalid`);

        this.#camera = camera;

        camera.polarDistance_0.copy   = camera.polarDistance_0.update_dleff0$;
        camera.pitch_0.copy           = camera.pitch_0.update_dleff0$;
        camera.elevation_0.copy       = camera.elevation_0.update_dleff0$;
        camera.pivot_0.copy           = camera.pivot_0.update_sl07mc$;

        function coerceIn(t, e, n) {
            return t < e ? e : t > n ? n : t
        }
        
        Object.defineProperty(camera, 'pathPosition', {
            get: function() {
                return this.pathPosition_dl3fsr$_0
            },
            set: function(t) {
                let e = coerceIn(t, -Math.PI / 2, Math.PI / 2);
                this.pathPointElevation_0 = this.pathPosition_dl3fsr$_0 = e,
                this.pathPositionOffset_0 = coerceIn(this.pathPositionOffset_0, -e, 1 - e),
                this.updatePathPoint_0()
            },
            enumerable: true,
            configurable: true
        })

        camera.getCollisionTime_0 = function () {
            return 1;
        }

        camera.polarDistance_0.update_dleff0$ = function (t, e) {
            if (cameraHack.#config.state === false || !document.pointerLockElement) 
                return this.copy(t, e);

            this.value += (cameraHack.#distance - this.value) / 20;
        };

        camera.pitch_0.update_dleff0$ = function (t, e) {
            if (cameraHack.#config.state === false || !document.pointerLockElement) 
                return this.copy(t, e);

            this.value = camera.pathPosition;
        };

        camera.elevation_0.update_dleff0$ = function (t, e) {
            if (cameraHack.#config.state === false || !document.pointerLockElement) 
                return this.copy(t, e);
            
            this.value = camera.pathPosition + 0.2;
        };

        camera.pivot_0.update_sl07mc$ = function (t, e) {
            let body = cameraHack.#spectateBody?.['TankPhysicsComponent']?.body;
            
            this.copy(t, body ? body.state.position : e);
        };

        controller.cameraDown_0 = function (t) {
            if ((airBreak.state && utils.isBindPressed(config.data.airBreakData.movementData.down)) || (cameraHack.#config.state && document.pointerLockElement))
                return this.down_0 = false;

            this.down_0 = t.isPressed;
        };

        controller.cameraUp_0 = function (t) {
            if ((airBreak.state && utils.isBindPressed(config.data.airBreakData.movementData.up)) || (cameraHack.#config.state && document.pointerLockElement))
                return this.up_0 = false;

            this.up_0 = t.isPressed;
        };

        if (this.#mousemoveEvent !== true) {
            document.addEventListener('mousemove', e => {
                if (this.#config.state === false || !this.#camera || !document.pointerLockElement)
                    return;
                
                this.#camera.pathPosition += 1 * (5e-5 + (0.001 - 5e-5) * 50 / 100) * e.movementY;
            }, false);

            this.#mousemoveEvent = true;
        }

        this.#initialized = true;
    }
}