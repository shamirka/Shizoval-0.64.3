import { config, utils } from '../../index.js';

const __filename = 'src/Game/features/filters.js';

export default class Filters {
    #config = config.data.filtersData;

    process = () => {
        const canvas = document.querySelector('#root > div > canvas');

        if (!canvas)
            return utils.debug(__filename, 11, 'Filters::process', 'canvas (expected HTMLCanvasElement) invalid');

        let filter = '';

        if (this.#config.blur !== 0) filter += `blur(${this.#config.blur}px) `;
        if (this.#config.brightness !== 0) filter += `brightness(${this.#config.brightness}) `;
        if (this.#config.contrast !== 0) filter += `contrast(${this.#config.contrast}%) `;
        if (this.#config.grayscale !== 0) filter += `grayscale(${this.#config.grayscale}%) `;
        if (this.#config['hue-rotate'] !== 0) filter += `hue-rotate(${this.#config['hue-rotate']}deg) `;
        if (this.#config.invert !== 0) filter += `invert(${this.#config.invert}%) `;
        if (this.#config.saturate !== 0) filter += `saturate(${this.#config.saturate}) `;
        if (this.#config.sepia !== 0) filter += `sepia(${this.#config.sepia}%) `;

        canvas.style.filter = filter;
    }
}