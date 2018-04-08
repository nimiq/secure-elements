import XElement from '/libraries/x-element/x-element.js';
import AutoComplete from './auto-complete.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.min.js';

export default class XMnemonicInputField extends XElement {

    html() {
        return `<input type="text" autocorrect="off" autocapitalize="none" spellcheck="false">`;
    }

    onCreate() {
        this.$input = this.$('input');
    }

    styles() { return ['x-input'] }

    setupAutocomplete() {
        this.autocomplete = new AutoComplete({
            selector: this.$input,
            source: (term, response) => {
                term = term.toLowerCase();
                const list = MnemonicPhrase.DEFAULT_WORDLIST.filter(word => {
                    return word.slice(0, term.length) === term;
                });
                response(list);
            },
            minChars: 3,
            delay: 0
        });
    }

    focus() {
        requestAnimationFrame(_ => this.$input.focus());
    }

    get value() {
        return this.$input.value;
    }

    listeners() {
        return {
            'keydown input': this._onKeydown.bind(this),
            'blur input': this._onBlur.bind(this)
        }
    }

    _onBlur(_, e) {
        this._checkValidity();
    }

    _onKeydown(_, e) {
        this._onValueChanged();

        if (e.keyCode === 32 /* space */ ) e.preventDefault();

        const triggerKeyCodes = [32 /* space */, 13 /* enter */];
        if (triggerKeyCodes.includes(e.keyCode)) {
            this._checkValidity();
        }
    }

    _checkValidity() {
        if (MnemonicPhrase.DEFAULT_WORDLIST.includes(this.value.toLowerCase())) {
            this.$el.classList.add('complete');
            this.complete = true;
            this.fire(this.__tagName + '-valid', this.value);
        } else {
            this._onInvalid();
        }
    }

    async _onInvalid() {
        await this.animate('shake');
        this.$input.value = '';
    }

    _onValueChanged() {
        if (this._value === this.value) return;

        if (this.value.length > 2) {
             this.$input.setAttribute('list', 'x-mnemonic-wordlist');
        } else {
             this.$input.removeAttribute('list');
        }

        this.complete = false;
        this.$el.classList.remove('complete');
        this._value = this.value;
    }
}
