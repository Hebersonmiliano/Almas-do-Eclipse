(function (root) {
  'use strict';

  const BUTTONS = {
    confirm: 0, cancel: 1, bomb: 2, meteor: 3,
    previousTab: 4, time: 5, back: 8, pause: 9,
    up: 12, down: 13, left: 14, right: 15
  };

  function applyDeadzone(value, deadzone = 0.2) {
    const magnitude = Math.abs(Number(value) || 0);
    if (magnitude <= deadzone) return 0;
    return Math.sign(value) * Math.min(1, (magnitude - deadzone) / (1 - deadzone));
  }

  function buttonPressed(button) {
    return Boolean(button && (button.pressed || button.value > 0.5));
  }

  function create(getGamepads, options = {}) {
    const deadzone = options.deadzone ?? 0.2;
    let previous = {};
    function poll() {
      const pads = Array.from(getGamepads?.() || []);
      const gamepad = pads.find(pad => pad && pad.connected !== false) || null;
      if (!gamepad) {
        previous = {};
        return { connected: false, id: '', move: { x: 0, y: 0 }, pressed: {}, justPressed: {} };
      }
      let x = applyDeadzone(gamepad.axes?.[0], deadzone);
      let y = applyDeadzone(gamepad.axes?.[1], deadzone);
      if (buttonPressed(gamepad.buttons?.[BUTTONS.left])) x = -1;
      if (buttonPressed(gamepad.buttons?.[BUTTONS.right])) x = 1;
      if (buttonPressed(gamepad.buttons?.[BUTTONS.up])) y = -1;
      if (buttonPressed(gamepad.buttons?.[BUTTONS.down])) y = 1;
      const pressed = {};
      for (const [name, index] of Object.entries(BUTTONS)) pressed[name] = buttonPressed(gamepad.buttons?.[index]);
      const justPressed = {};
      for (const name of Object.keys(BUTTONS)) justPressed[name] = pressed[name] && !previous[name];
      previous = pressed;
      return { connected: true, id: gamepad.id || 'Controle', move: { x, y }, pressed, justPressed };
    }
    return { poll };
  }

  const api = { BUTTONS, applyDeadzone, create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GameInput = api;
})(globalThis);
