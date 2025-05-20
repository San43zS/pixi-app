import { Assets, Texture } from "pixi.js";

export async function loadDigitSprites() {
    const [digitTextures, currencyTextures] = await Promise.all([
        loadTextures({
            '0': '0.png',
            '1': '1.png',
            '2': '2.png',
            '3': '3.png',
            '4': '4.png',
            '5': '5.png',
            '6': '6.png',
            '7': '7.png',
            '8': '8.png',
            '9': '9.png',
            '.': 'dot.png',
            ',': 'comma.png',
        }),
        loadTextures({
            'USD': 'dollar.png',
            'EUR': 'euro.png',
            'RUB': 'rub.png'
        })
    ]);

    return { digitTextures, currencyTextures };
}

async function loadTextures(textureMap: Record<string, string>): Promise<Record<string, Texture>> {
    const basePath = '../public/assets/';
    const entries = Object.entries(textureMap);

    const results = await Promise.allSettled(
        entries.map(async ([key, filename]) => {
            try {
                const texture = await Assets.load(basePath + filename);
                return { key, texture };
            } catch (error) {
                console.error(`Failed to load texture for "${key}":`, error);
                return null;
            }
        })
    );

    return results.reduce((acc, result) => {
        if (result.status === 'fulfilled' && result.value) {
            acc[result.value.key] = result.value.texture;
        }
        return acc;
    }, {} as Record<string, Texture>);
}