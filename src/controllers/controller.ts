import { Odometer } from "../sprite/odometr.ts";
import { Counter } from "../sprite/counter.ts";
import { AnimationMode, Formatter } from "../sprite/model/model.ts";

const DEFAULT_VALUES = {
    value: 0,
    duration: 2000,
    decimals: 2,
    currency: 'EUR',
    currencyBefore: true,
    mode: 'replacement' as AnimationMode
};

export function setupHTMLControls(odometer: Odometer, spinner: Counter) {
    const getElement = <T extends HTMLElement>(id: string): T => {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Element with id '${id}' not found`);
        return el as T;
    };

    const valueInput = getElement<HTMLInputElement>('valueInput');
    const durationInput = getElement<HTMLInputElement>('durationInput');
    const setBtn = getElement<HTMLButtonElement>('setBtn');
    const resetBtn = getElement<HTMLButtonElement>('resetBtn');
    const stopBtn = getElement<HTMLButtonElement>('stopBtn');
    const completeBtn = getElement<HTMLButtonElement>('completeBtn');
    const currencySelect = getElement<HTMLSelectElement>('currencySelect');
    const currencyPosition = getElement<HTMLSelectElement>('currencyPosition');
    const decimalsInput = getElement<HTMLInputElement>('decimalsInput');
    const mode = getElement<HTMLSelectElement>('mode');

    const handleSet = () => {
        const formatOptions: Formatter = {
            currency: currencySelect.value || DEFAULT_VALUES.currency,
            currencyBefore: currencyPosition.value === 'true',
            decimalSeparator: 'dot',
            thousandSeparator: 'comma',
            decimalsNumber: parseInt(decimalsInput.value) || DEFAULT_VALUES.decimals,
            mode: (mode.value as AnimationMode) || DEFAULT_VALUES.mode
        };
        console.log(formatOptions.mode)

        const value = parseFloat(valueInput.value) || DEFAULT_VALUES.value;
        const duration = parseInt(durationInput.value) || DEFAULT_VALUES.duration;

        odometer.format(formatOptions);
        spinner.format(formatOptions);

        odometer.spin(value, duration);
        spinner.spin(value, duration);
    };

    setBtn.addEventListener('click', handleSet);
    resetBtn.addEventListener('click', () => {
        odometer.reset(DEFAULT_VALUES.value);
        spinner.reset(DEFAULT_VALUES.value);
    });
    stopBtn.addEventListener('click', () => {
        odometer.stop();
        spinner.stop();
    });
    completeBtn.addEventListener('click', () => {
        odometer.complete();
        spinner.complete();
    });
}