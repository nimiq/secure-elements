import XPinpad from "../x-pinpad.js";

const $pinpad = new XPinpad();
$pinpad.onEntry();
// simulate fail
addEventListener('x-pin', e => $pinpad.onPinIncorrect());