import XElement from '/libraries/x-element/x-element.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.min.js';
import XMnemonicInputField from './x-mnemonic-input-field.js';

export default class XMnemonicInput extends XElement {
    html() {
        return `
            <form autocomplete="off"></form>
            <x-mnemonic-input-success></x-mnemonic-input-success>`;
    }

    styles() {
        return ['x-recovery-phrase']
    }

    focus() {
        this.$fields[0].$input.focus();
    }

    onCreate() {
        this.$fields = [];
        this.$form = this.$('form');

        for (let i = 0; i < 24; i++) {
            this._createField(i);
        }

        this._datalistSupport = this._hasDatalistSupport();

        if (this._datalistSupport) {
            this._createDatalist();
        } else {
            this.$fields.forEach(field => field.setupAutocomplete());
        }

        this._mnemonic = '';
        setTimeout(() => this.$('input').focus(), 100);
    }

    listeners() {
        return {
            'x-mnemonic-input-field-valid': this._onFieldComplete.bind(this),
            'x-set-focus-to-next-input': this._setFocusToNextInput.bind(this)
        }
    }

    _createField(index) {
        const field = XMnemonicInputField.createElement();
        field.$input.placeholder = 'word #' + (index + 1);
        field.$el.setAttribute('data-x-id', index);

        field.addEventListener('click', this._showInput.bind(this));
        field.addEventListener('mouseenter', this._showInput.bind(this));
        field.addEventListener('mouseleave', this._showPlaceholder.bind(this));

        this.$form.appendChild(field.$el);
        this.$fields.push(field);
    }

    _hasDatalistSupport() {
        return !!('list' in document.createElement('input'))
            && !!(document.createElement('datalist') && window.HTMLDataListElement);
    }

    _createDatalist() {
        const datalist = document.createElement('datalist');
        datalist.setAttribute('id', 'x-mnemonic-wordlist');
        MnemonicPhrase.DEFAULT_WORDLIST.forEach(word => {
            const option = document.createElement('option');
            option.textContent = word;
            datalist.appendChild(option);
        });
        this.$el.appendChild(datalist);
    }

    _onFieldComplete(value, e) {
        if (!value) return;

        this._showPlaceholder(e);

        this._checkPhraseComplete();
    }

    _checkPhraseComplete() {
        const check = this.$fields.find(field => !field.complete);
        if (typeof check !== 'undefined') return;

        const mnemonic = this.$fields.map(field => field.$input.value).join(' ');
        try {
            const privateKey = MnemonicPhrase.mnemonicToKey(mnemonic);
            this.fire(this.__tagName, privateKey);
        } catch (e) {
            console.log(e.message);
            this._animateError();
        }
    }

    _setFocusToNextInput(index) {
        if (index < this.$fields.length) {
            this.$fields[index].focus();
        }
    }

    _animateError() {
        this.animate('shake');
    }

    _showPlaceholder({ target }) {
        if (target.classList.contains('has-placeholder')) return;

        // don't hide empty input fields
        const $input = XElement.get(target).$input;
        if ($input.value === '') return;

        // don't hide focused input fields
        if (document.activeElement === $input) return;

        target.classList.add('has-placeholder');

        const $placeholder = document.createElement('div');
        $placeholder.className = 'placeholder';
        const id = parseInt(target.getAttribute('data-x-id'));
        $placeholder.textContent = (id + 1).toString();

        target.replaceChild($placeholder, target.childNodes[0]);

        this._revealedWord = undefined;
    }

    _showInput({ target }) {
        if (this._revealedWord === target || !target.classList.contains('has-placeholder')) return;

        const $input = XElement.get(target).$input;

        target.replaceChild($input, target.childNodes[0]);

        // hide word which was revealed before
        if (this._revealedWord !== undefined) {
            this._showPlaceholder({ target: this._revealedWord });
        }

        this._revealedWord = target;

        target.classList.remove('has-placeholder');
    }
}
