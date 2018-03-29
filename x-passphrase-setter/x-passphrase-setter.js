import XPassphraseInput from '../x-passphrase-input/x-passphrase-input.js';
import XPassphraseIndicator from '../x-passphrase-indicator/x-passphrase-indicator.js';
import XElement from '/libraries/x-element/x-element.js';

export default class XPassphraseSetter extends XElement {
    html() {
        const { buttonLabel } = this.attributes;

        return `
            <x-passphrase-input></x-passphrase-input>
            <x-passphrase-indicator></x-passphrase-indicator>
            <x-grow></x-grow>
            <button disabled>${ buttonLabel || 'Confirm' }</button>
        `;
    }

    onCreate() {
        this.$button = this.$('button');
        // TODO is it correct to disable autocompletion and force users to re-enter password?
        this.$('input').setAttribute('autocomplete', 'new-password');
    }

    children() {
        return [ XPassphraseInput, XPassphraseIndicator];
    }

    listeners() {
        return {
            'x-passphrase-input-change': value => this._onPasswordUpdate(value),
            'click button': e => this._onPasswordSubmit(),
            'keydown input': (d, e) => { if (e.keyCode == 13) this._onPasswordSubmit() }
        }
    }

    focus() {
        this.$passphraseInput.focus();
    }

    get value() {
        return this.$passphraseInput.value;
    }

    _onPasswordUpdate(password) {
        const strength = this._getPasswordStrength(password);
        this.$passwordIndicator.setStrength(strength);
        if (strength < 3) {
            this.$button.setAttribute('disabled', 'disabled');
        } else {
            this.$button.removeAttribute('disabled');
        }
    }

    _onPasswordSubmit() {
        this.fire(this.__tagName + '-submitted', this.value);
    }

    /** @param {string} password
     * @return {number} */
    _getPasswordStrength(password) {
        if (password.length === 0) return 0;
        if (password.length < 7) return 1;
        if (password.length < 10) return 2;
        if (password.length < 14) return 3;
        return 4;
    }
}
