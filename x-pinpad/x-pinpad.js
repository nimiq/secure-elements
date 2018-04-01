import XElement from '/libraries/x-element/x-element.js';
import KeyboardHandler from '/libraries/secure-utils/keyboard-handler/keyboard-handler.js';

export default class XPinpad extends XElement {
    styles() { return ['center'] }

    html() {
        return `
            <x-pin>
                <x-dot></x-dot>
                <x-dot></x-dot>
                <x-dot></x-dot>
                <x-dot></x-dot>
                <x-dot></x-dot>
                <x-dot></x-dot>
            </x-pin>
            <x-pinpad-container>
                <button>1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                <button>6</button>
                <button>7</button>
                <button>8</button>
                <button>9</button>
                <button>0</button>
            </x-pinpad-container>
            <x-delete></x-delete>`
    }

    onCreate() {
        this.$pin = this.$('x-pin');
        this.$dots = this.$pin.querySelectorAll('x-dot');
        this.addEventListener('click', e => this._onClick(e));
        this.$('x-delete').addEventListener('click', e => this._onDelete());
        this._attempts = 0;
        this._waitingTime = 50;
        this._handleKeyboardInput = this.__handleKeyboardInput.bind(this)
    }

    reset() {
        this._pin = '';
        this._setMaskedPin();
        this.$el.classList.remove('unlocking');
        this.$el.classList.remove('shake-pinpad');
        this._unlocking = false;
    }

    open() {
        this.reset();
        KeyboardHandler.setGlobalListener(this._handleKeyboardInput);
    }

    close() {
        KeyboardHandler.removeGlobalListener();
        this.reset();
    }

    get unlocking() {
        return this._unlocking;
    }

    __handleKeyboardInput (e) {
        const inputCharString = e.key;
        const inputNumber = parseInt(inputCharString);
        if(isNaN(inputNumber)){
            e.preventDefault(); //stop character from entering input
        }
        else {
          this._onKeyPressed(inputNumber); 
        }
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        const key = e.target.textContent;
        this._onKeyPressed(key);
    }

    _onKeyPressed(key) {
        if (this._unlocking) return;
        this._pin += key;
        this._setMaskedPin();
        if (this._pin.length === 6) this._submit();
    }

    _submit() {
        this._unlocking = true;
        this.$el.classList.add('unlocking');
        this.fire('x-pin', this._pin);
    }

    onPinIncorrect() {
        this.$el.classList.remove('unlocking');
        this.$el.classList.add('shake-pinpad');
        this._attempts++;
        if (this._attempts === 3) {
          this._waitingTime *= this._waitingTime;
          this._attempts = 0;
        }
        setTimeout(() => this.reset(), this._waitingTime);
    }

    _onDelete() {
        if (this._unlocking) return;
        this._pin = this._pin.substr(0, this._pin.length - 1);
        this._setMaskedPin();
    }

    _setMaskedPin() {
        const length = this._pin.length;
        this.$dots.forEach((e, i) => {
            if (i < length) {
                e.setAttribute('on', 1);
            } else {
                e.removeAttribute('on');
            }
        })
    }
}