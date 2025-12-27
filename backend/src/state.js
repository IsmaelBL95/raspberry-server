// src/state.js
const state = {
  mode: 'BOOTING', // BOOTING | NORMAL | BOOTSTRAP | ERROR
  db: 'UNKNOWN', // UNKNOWN | UP | DOWN
  dbError: null,
}

export default state