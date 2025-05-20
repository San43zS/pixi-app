export type SeparatorType = 'comma' | 'dot' | 'space' | 'none';
export type AnimationMode = 'instant' | 'replacement' | 'ascending';
export type CurrencySymbol = 'USD' | 'EUR' | 'RUB' | string;

export interface Formatter{
    currency?: CurrencySymbol;
    currencyBefore?: boolean;
    decimalSeparator?: SeparatorType;
    thousandSeparator?: SeparatorType;
    decimalsNumber?: number;
    mode?: AnimationMode;
}

export interface ISpinner {
    format(format: Formatter): void;
    reset(value: number): void;
    spin(target: number, time: number): void;
    complete(): void;
    update(deltaTime: number): void;
    stop(): void;
}