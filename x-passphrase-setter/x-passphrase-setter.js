import XPassphraseInput from '../x-passphrase-input/x-passphrase-input.js';
import XPassphraseIndicator from '../x-passphrase-indicator/x-passphrase-indicator.js';
import XElement from '/libraries/x-element/x-element.js';

export default class XPassphraseSetter extends XElement {
    html() {
        const { buttonLabel } = this.attributes;

        return `
            <h2>Choose your Pass Phrase:</h2>
            <x-passphrase-input></x-passphrase-input>
            <x-passphrase-indicator></x-passphrase-indicator>
            <x-grow></x-grow>
            <button disabled>${ buttonLabel || 'Confirm' }</button>
        `;
    }

    onCreate() {
        this.$button = this.$('button');
        this.$('input').setAttribute('autocomplete', 'new-password');
    }

    children() {
        return [ XPassphraseInput, XPassphraseIndicator];
    }

    listeners() {
        return {
            'x-passphrase-input-change': value => this._onPassphraseUpdate(value),
            'click button': e => this._onPassphraseSubmit(),
            'keydown input': (d, e) => { if (e.keyCode == 13) this._onPassphraseSubmit() }
        }
    }

    focus() {
        this.$passphraseInput.focus();
    }

    get value() {
        return this.$passphraseInput.value;
    }

    clear() {
        this.$passphraseInput.value = '';
    }

    _passphraseIsValid(passphrase) {
        return this._getPassphraseStrength(passphrase) >= 3;
    }

    _onPassphraseUpdate(passphrase) {
        const strength = this._getPassphraseStrength(passphrase);
        this.$passphraseIndicator.setStrength(strength);
        if (this._passphraseIsValid(passphrase)) {
            this.$button.removeAttribute('disabled');
        } else {
            this.$button.setAttribute('disabled', 'disabled');
        }
    }

    _onPassphraseSubmit() {
        if (this._passphraseIsValid (this.value)) {
            this.fire(this.__tagName + '-submitted', this.value);
        }
    }

    /** @param {string} passphrase
     * @return {number} */
    _getPassphraseStrength(passphrase) {
        if (passphrase.length === 0) return 0;
        if (passphrase.length < 7) return 1;
        if (passphrase.length < 10) return 2;
        if (passphrase.length < 14) return 3;
        return 4;
    }
}
