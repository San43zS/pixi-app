import { Container, Sprite, Texture } from 'pixi.js';
import { AnimationMode, Formatter, ISpinner, SeparatorType } from "./model/model.ts";
import {DEFAULT_ANIMATION_DURATION, DigitChar, SeparatorChar, SEPARATOR_ANCHOR, SEPARATOR_SCALE} from "./model/const.ts";

export class Odometer extends Container implements ISpinner {
    private _currentValue: number = 0;
    private _targetValue: number = 0;
    private _startValue: number = 0;
    private _formatter: Required<Formatter>;
    private readonly _digitTextures: Record<string, Texture>;
    private readonly _currencyTextures: Record<string, Texture>;
    private _digitContainers: Container[] = [];
    private _currencySprite?: Sprite;
    private _animationStartTime: number = 0;
    private _animationDuration: number = 0;
    private _isAnimating: boolean = false;
    private _mode: AnimationMode;
    private _oldNum:string[] = [];
    private readonly _digitHeight: number;

    constructor(
        digitTextures: Record<string, Texture>,
        currencyTextures: Record<string, Texture>,
        initialValue: number = 0,
        initialMode: AnimationMode = 'replacement'
    ) {
        super();
        this._digitTextures = digitTextures;
        this._currencyTextures = currencyTextures;
        this._mode = initialMode;
        this._digitHeight = new Sprite(digitTextures['0']).height;
        this._formatter = this._createDefaultFormatter(initialMode);
        this.reset(initialValue);
    }

    public format(format: Partial<Formatter>): void {
        this._formatter = { ...this._formatter, ...format };
        if (format.mode !== undefined) {
            this._mode = format.mode;
        }
        this._render();
    }

    public reset(value: number): void {
        this._currentValue = value;
        this._targetValue = value;
        this._startValue = value;
        this._isAnimating = false;
        this._render();
    }

    public spin(target: number, duration: number = DEFAULT_ANIMATION_DURATION): void {
        if (this._mode === 'instant') {
            this.setValue(target);
            return;
        }

        if (target === this._targetValue) {
            this._isAnimating = false;
            return;
        }
        this._startValue = 0;
        this._targetValue = target;
        this._animationDuration = duration;
        this._animationStartTime = performance.now();
        this._isAnimating = true;
    }

    public complete(): void {
        this._currentValue = this._targetValue;
        this._isAnimating = false;
        this._render();
    }

    public stop(): void {
        this._isAnimating = false;
    }

    public update(): void {
        if (!this._isAnimating) return;

        const currentTime = performance.now();
        let progress = this._calculateAnimationProgress(currentTime);
        console.log(`progress = ${progress}, targetValue = ${this._targetValue},
            currentValue = ${this._currentValue}, startValue = ${this._startValue},
            animationDuration = ${this._animationDuration}, animationStartTime = ${this._animationStartTime}
            currentTime = ${currentTime}`);

        this._updateCurrentValue(progress);
        let tmp = this._render()
        this._oldNum = this.ConvertZero()
        console.log(`OLDNUM = ${this._oldNum}`)
        this._animateDigitPositions(progress, tmp)

        if (progress >= 1) {
            this.complete();
        }
    }

    public ConvertZero(): string[] {
        const countDigits = this._formatter.decimalsNumber;
        const targetStr = this._targetValue.toString();

        const separatorIndex = targetStr.indexOf('.');
        const integerDigitsCount = separatorIndex >= 0
            ? separatorIndex
            : targetStr.length;

        const integerPart = Array(integerDigitsCount).fill('0');

        if (countDigits <= 0) {
            return integerPart;
        }

        const separator = this._getSeparator(this._formatter.decimalSeparator);
        const fractionalPart = Array(countDigits).fill('0');

        let f = [...integerPart, separator, ...fractionalPart]
        console.log(`NumString = ${f.join('')}`);
        return f;
    }

    private _createDefaultFormatter(mode: AnimationMode): Required<Formatter> {
        return {
            currency: '',
            currencyBefore: true,
            decimalSeparator: 'dot',
            thousandSeparator: 'comma',
            decimalsNumber: 2,
            mode
        };
    }

    private _createDigitContainer(): Container {
        const container = new Container();

        for (let i = 0; i < 10; i++) {
            const digit = new Sprite(this._digitTextures[i]);
            digit.y = -i * this._digitHeight;
            container.addChild(digit);
        }

        return container;
    }

    private _render(): string {
        this._clearDisplay();
        const valueToRender = this._mode === 'ascending'
            ? this._currentValue
            : this._targetValue;
        console.log(`valueToRender = ${valueToRender}`)

        const formattedValue = this._formatNumber(valueToRender);

        this._renderFormattedValue(formattedValue);
        return formattedValue
    }

    private _clearDisplay(): void {
        this.removeChildren();
        this._digitContainers = [];
        this._currencySprite = undefined;
    }

    private _renderFormattedValue(formattedValue: string): void {
        let xPos = this._renderCurrency(true);

        for (const char of formattedValue) {
            if (this._isSeparator(char)) {
                xPos = this._renderSeparator(char as SeparatorChar, xPos);
            } else if (this._isDigit(char)) {
                xPos = this._renderDigit(char as DigitChar, xPos);
            }

        }
        this._renderCurrency(false, xPos);
    }

    private _renderCurrency(isBefore: boolean, xPos: number = 0): number {
        if (!this._formatter.currency || !this._currencyTextures[this._formatter.currency]) {
            return xPos;
        }

        if (isBefore === this._formatter.currencyBefore) {
            this._currencySprite = new Sprite(this._currencyTextures[this._formatter.currency]);
            this._currencySprite.x = xPos;
            this.addChild(this._currencySprite);
            return xPos + this._currencySprite.width;
        }

        return xPos;
    }

    private _renderSeparator(char: SeparatorChar, xPos: number): number {
        const separator = new Sprite(this._digitTextures[char]);
        separator.scale.set(SEPARATOR_SCALE);
        separator.anchor.set(SEPARATOR_ANCHOR.x, SEPARATOR_ANCHOR.y);
        separator.y = this._digitHeight;
        separator.x = xPos;
        this.addChild(separator);
        return xPos + separator.width;
    }

    private _renderDigit(char: DigitChar, xPos: number): number {
        const container = this._createDigitContainer();
        const targetY = parseInt(char) * this._digitHeight;

        container.x = xPos;
        container.y = targetY;

        this._digitContainers.push(container);
        this.addChild(container);

        return xPos + container.width;
    }

    private _calculateAnimationProgress(currentTime: number): number {
        return Math.min(
            (currentTime - this._animationStartTime) / this._animationDuration,
            1
        );
    }

    public setValue(value: number): void {
        this._currentValue = value;
        this._targetValue = value;
        this._isAnimating = false;
        this._render();
    }

    private _updateCurrentValue(progress:number): void {
        if (this._mode === 'instant') return;

        switch (this._mode) {
            case 'replacement':
                const range = this._targetValue - this._startValue;
                const randomFactor = Math.random()/2 * range;
                this._currentValue = this._startValue + randomFactor;
                break;

            case 'ascending':
                this._currentValue = this._targetValue * progress;
                break;

            default:
                this._currentValue = this._targetValue;
        }
    }

    private _animateDigitPositions(progress: number, formattedValue: string): void {
        const digitCount = this._digitContainers.length;
        const valueDigits = formattedValue.split('').filter(c => this._isDigit(c)).map(Number);
        const oldDigits = this._oldNum;

        for (let i = digitCount - 1; i >= 0; i--) {
            const container = this._digitContainers[i];
            const targetNum = valueDigits[i] || 0;
            const startNum = parseInt(oldDigits[i]) || 0;

            const digitWeight = digitCount - 1 - i;

            const digitProgress = Math.max(0, progress * 10 - digitWeight);
            const clampedProgress = Math.min(digitProgress, 1);

            if (clampedProgress <= 0) {
                console.log("FLAGGGGG")
                container.y = startNum * this._digitHeight;
                continue;
            }

            const easedProgress = this._easeOutQuad(clampedProgress);
            const distance = (targetNum - startNum + 10) % 10;
            const currentPos = startNum + distance * easedProgress;
            const normalizedPos = currentPos % 10;
            container.y = normalizedPos * this._digitHeight;
            this._oldNum[i] = targetNum.toString();
            console.log(`oldNumArray = ${this._oldNum}`)
        }

    }

    private _easeOutQuad(t: number): number {
        return t * (2 - t);
    }

    private _isDigit(char: string): boolean {
        return /^[0-9]$/.test(char);
    }

    private _isSeparator(char: string): boolean {
        return char === this._getSeparator(this._formatter.thousandSeparator) ||
            char === this._getSeparator(this._formatter.decimalSeparator);
    }

    private _formatNumber(value: number): string {
        const absValue = Math.abs(value);
        const integerPart = Math.floor(absValue);
        let fractionalPart = absValue - integerPart;

        let formattedInteger = integerPart.toString();
        if (this._formatter.thousandSeparator !== 'none') {
            formattedInteger = formattedInteger.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                this._getSeparator(this._formatter.thousandSeparator)
            );
        }

        let formattedFraction = '';
        if (this._formatter.decimalsNumber > 0) {
            const power = Math.pow(10, this._formatter.decimalsNumber);
            fractionalPart = Math.round(fractionalPart * power) / power;
            formattedFraction = fractionalPart.toString().split('.')[1] || '';
            formattedFraction = formattedFraction.padEnd(this._formatter.decimalsNumber, '0');
        }

        let result = value < 0 ? '-' : '';
        result += formattedInteger;

        if (formattedFraction) {
            result += this._getSeparator(this._formatter.decimalSeparator) + formattedFraction;
        }

        return result;
    }

    private _getSeparator(type: SeparatorType): SeparatorChar {
        switch (type) {
            case 'comma': return ',';
            case 'dot': return '.';
            case 'space': return ' ';
            default: return '' as SeparatorChar;
        }
    }
}