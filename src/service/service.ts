import { Application, Graphics, Container, Texture } from 'pixi.js';
import { loadDigitSprites } from "../pkg/number";
import { setupHTMLControls } from "../controllers/controller.ts";
import { Odometer } from "../sprite/odometr.ts";
import { Counter } from "../sprite/counter.ts";
import { Formatter } from "../sprite/model/model.ts";

const CONTAINER_WIDTH_RATIO = 0.8;
const CONTAINER_HEIGHT = 200;
const ELEMENT_SCALE = 0.05;
const ELEMENT_POSITION = { x: 40, y: 40 };

const DEFAULT_FORMAT_OPTIONS: Formatter = {
    currency: 'EUR',
    currencyBefore: true,
    decimalSeparator: 'dot',
    thousandSeparator: 'comma',
    decimalsNumber: 2,
};

function createFrameContainer(
    app: Application,
    width: number,
    height: number,
    yPos: number,
    maskHeight: number = 50
): { container: Container; mask: Graphics } {
    const container = new Container();
    const bg = new Graphics()
        .beginFill(0x222222)
        .drawRoundedRect(0, 0, width, height, 10)
        .endFill();

    const frame = new Graphics()
        .lineStyle(4, 0x555555)
        .drawRoundedRect(0, 0, width, height, 10);

    const mask = new Graphics()
        .beginFill(0xFFFFFF)
        .drawRect(20, 40, width - 40, maskHeight)
        .endFill();

    container.addChild(bg, frame, mask);
    container.position.set(app.screen.width * 0.1, yPos);

    return { container, mask };
}

function setupOdometer(
    app: Application,
    digitTextures: Record<string, Texture>,
    currencyTextures: Record<string, Texture>,
    yPos: number
): Odometer {
    const { container, mask } = createFrameContainer(
        app,
        app.screen.width * CONTAINER_WIDTH_RATIO,
        CONTAINER_HEIGHT,
        yPos
    );

    const odometer = new Odometer(digitTextures, currencyTextures, 0, 'replacement');
    odometer.scale.set(ELEMENT_SCALE);
    odometer.position.set(ELEMENT_POSITION.x, ELEMENT_POSITION.y);
    odometer.mask = mask;
    odometer.format(DEFAULT_FORMAT_OPTIONS);

    container.addChild(odometer);
    app.stage.addChild(container);

    return odometer;
}

function setupCounter(
    app: Application,
    digitTextures: Record<string, Texture>,
    currencyTextures: Record<string, Texture>,
    yPos: number
): Counter {
    const { container, mask } = createFrameContainer(
        app,
        app.screen.width * CONTAINER_WIDTH_RATIO,
        CONTAINER_HEIGHT,
        yPos
    );

    const counter = new Counter(digitTextures, currencyTextures, 0, 'replacement');
    counter.scale.set(ELEMENT_SCALE);
    counter.position.set(ELEMENT_POSITION.x, ELEMENT_POSITION.y);
    counter.mask = mask;
    counter.format(DEFAULT_FORMAT_OPTIONS);

    container.addChild(counter);
    app.stage.addChild(container);

    return counter;
}

export async function createSpinnerExample(app: Application) {
    let digitTextures: Record<string, Texture> = {};
    let currencyTextures: Record<string, Texture> = {};

    try {
        const loadedTextures = await loadDigitSprites();
        digitTextures = loadedTextures.digitTextures;
        currencyTextures = loadedTextures.currencyTextures;
        console.log('Textures loaded:', Object.keys(digitTextures));
    } catch (error) {
        console.error('Failed to load textures:', error);
    }

    const odometer = setupOdometer(
        app,
        digitTextures,
        currencyTextures,
        (app.screen.height - 400)/2
    );

    const counter = setupCounter(
        app,
        digitTextures,
        currencyTextures,
        odometer.y + 220
    );

    setupHTMLControls(odometer, counter);

    app.ticker.add(() => {
        odometer.update();
        counter.update();
    });
}