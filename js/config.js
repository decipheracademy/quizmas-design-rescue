// Design Rescue settings. Change these without touching the game code.
window.DR_CONFIG = {
  // Paste the Google Apps Script web-app URL here once the score sheet is set up.
  // While empty, scores are kept safely on the device and sent later.
  SHEETS_URL: "https://script.google.com/macros/s/AKfycbzNIRSHzWooF2oLNp68XtbyCHtQu5AvMelMQ0-PJx0l84wNULsqjj8UtkDTaS5bWmGI8Q/exec",
  GAME_ID: "design-rescue",
  GAME_NAME: "Design Rescue: Fix That Flyer",
  // Seconds for each stage.
  STAGE_TIME: { 1: 60, 2: 120, 3: 75 },
  // Set to false to remove the Glitch character's lines (the game still works).
  SHOW_GLITCH: true,
  // Minimum time the loading screen stays up, so it never just flashes.
  LOADER_MIN_MS: 2600,
};
