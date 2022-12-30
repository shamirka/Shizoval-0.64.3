import { utils } from '../../index.js';

const __filename = 'src/Game/features/storeOpener.js';

export default class StoreOpener {
    openStore = (root) => {
        let shop = root?.state?.shop;

        if (!shop)
            return utils.debug(__filename, 9, 'StoreOpener::openStore', 'shop (expected Shop) invalid');

        !shop.enabled && (shop.enabled = true);
    }
}