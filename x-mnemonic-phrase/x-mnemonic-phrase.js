import XElement from '/libraries/x-element/x-element.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.min.js';

export default class XMnemonicPhrase extends XElement {

    styles() { return ['x-recovery-phrase'] }

    _onPropertiesChanged(changes) {
        if (changes.privateKey) {
            this.privateKey = changes.privateKey;
        }
    }

    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(/\s+/g);

        const html = words.map((word, index) =>
            `${ [0, 8, 16].includes(index) ? `<div class="x-word-section section-${ Math.ceil((index + 1) / 8) }" onclick="">` : '' }
                <div class="x-word">
                    <span class="x-word-placeholder">${ index + 1 }</span>
                    <span class="x-word-content" title="word #${index + 1}">${ word }</span>
                </div>
            ${ [7, 15, 23].includes(index) ? `</div>` : '' }
            `).join('');

        this.$el.innerHTML = html;

        // for (let i = 0; i < 24; i++) {
        //     this.$(`#word${i}`).addEventListener('click', () => this._showWord(words[i], i));
        //     this.$(`#word${i}`).addEventListener('mouseenter', () => this._showWord(words[i], i));
        //     this.$(`#word${i}`).addEventListener('mouseleave', () => this._hideWord(i));
        // }
    }

    // _showWord(word, i) {
    //     // check if word is already visible
    //     if (this._revealedWord === i) return;

    //     // reveal content
    //     this.$(`#word${ i }`).textContent = word;

    //     // hide word which was revealed before
    //     if (this._revealedWord !== undefined) {
    //         this._hideWord(this._revealedWord);
    //     }

    //     this._revealedWord = i;
    // }

    // _hideWord(i) {
    //     this.$(`#word${ i }`).textContent = i + 1;

    //     this._revealedWord = undefined;
    // }
}
