import XElement from '/libraries/x-element/x-element.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.min.js';

export default class XValidateWords extends XElement {
    html() {
        return `
            <h1>Validate Recovery Words</h1>
            <p>Please select the following word from your list:</p>
            <x-grow></x-grow>
            <x-target-index></x-target-index>
            <x-wordlist>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
            </x-wordlist>
            <x-grow></x-grow>
            <a secondary x-href="/create-safe/words">Back to words</a>
        `
    }

    set privateKey(privateKey) {
        this.mnemonic = MnemonicPhrase.keyToMnemonic(privateKey);
    }

    set mnemonic(mnemonic) {
        if (!mnemonic) return;
        this._mnemonic = mnemonic.split(/\s+/g);
    }

    onCreate() {
        this.$buttons = this.$$('button');
        this.$targetIndex = this.$('x-target-index');
        this.addEventListener('click', e => this._onClick(e));
    }

    onEntry() {
        this._reset();
    }

    _reset() {
        if (!this._mnemonic) return;
        this._round = 0;
        this.mnemonic = this._mnemonic.join(' ');
        this._generateIndices();
        this._setContent(this._round);
    }

    _next() {
        this._round += 1;
        if (this._round < 3) {
            this._setContent(this._round);
        } else {
            this.fire('x-validate-words');
        }
    }

    _generateIndices() {
        this.requiredWords = [0, 1, 2].map(this._generateIndex);
    }

    _generateIndex(index) {
        return Math.floor(Math.random() * 8) + index * 8;
    }

    _setContent(round) {
        this._set(
            this._generateWords(this.requiredWords[round]), // wordlist
            this.requiredWords[round] + 1, // targetIndex
            this._mnemonic[this.requiredWords[round]] // targetWord
        );
    }

    _generateWords(wordIndex) {
        const words = {};

        words[this._mnemonic[wordIndex]] = wordIndex;

        // Select 7 additional unique words from the mnemonic phrase
        while (Object.keys(words).length < 8) {
            const index = Math.floor(Math.random() * 24);
            words[this._mnemonic[index]] = index;
        }

        return Object.keys(words).sort();
    }

    // per round

    /**
     * @param {string[]} wordlist
     * @param {number} targetIndex
     * @param {string} targetWord
     */
    _set(wordlist, targetIndex, targetWord) {
        this.$$('.correct').forEach(button => button.classList.remove('correct'));
        this.$$('.wrong').forEach(button => button.classList.remove('wrong'));
        this.setWordlist(wordlist);
        this.setTargetIndex(targetIndex);
        this._targetWord = targetWord;
    }

    setWordlist(wordlist) {
        this._wordlist = wordlist;
        wordlist.forEach((word, index) => this.$buttons[index].textContent = word);
        this.$buttons.forEach(button => button.removeAttribute('disabled'));
    }

    setTargetIndex(index) {
        this.$targetIndex.textContent = index;
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        this._onButtonPressed(e.target);
    }

    _onButtonPressed($button) {
        this.$buttons.forEach(button => button.setAttribute('disabled', 'disabled'));

        if ($button.textContent !== this._targetWord) {
            // wrong choice
            this._showAsWrong($button);
            const correctButtonIndex = this._wordlist.indexOf(this._targetWord);
            this._showAsCorrect(this.$buttons[correctButtonIndex]);
            setTimeout(() => this._reset(), 820);
        } else {
            // correct choice
            this._showAsCorrect($button);
            setTimeout(() => this._next(), 500);
        }
    }

    _showAsWrong($el) {
        $el.classList.add('wrong');
        this.animate('shake', $el);
    }

    _showAsCorrect($el) {
        $el.classList.add('correct');
    }
}
