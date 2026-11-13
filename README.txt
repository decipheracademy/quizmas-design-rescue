DESIGN RESCUE: FIX THAT FLYER
Quizmas Season 3 · Game Hub · Graphic Design Track, Game 1

WHAT IS IN THIS FOLDER
  index.html        The game (open this page to play)
  dashboard/        Staff scores dashboard (password protected)
  js/config.js      Settings: score sheet link, stage times, Glitch on/off
  css/, js/, fonts/, vendor/   Game files (do not rename)

PUT IT ONLINE (NETLIFY)
  Drag this whole folder onto app.netlify.com/drop (or your site's Deploys tab).
  The game opens at your Netlify link. The dashboard is at your-link/dashboard/

CONNECT THE SCORE SHEET
  Follow "Quizmas Score Sheet Setup Guide.docx" (next to this folder). In short:
  1. Create a Google Sheet, open Extensions > Apps Script, paste score-sheet/Code.gs (next to this folder).
  2. Change DASHBOARD_KEY to your own password, then Deploy > New deployment > Web app
     (Execute as: Me, Who has access: Anyone). Copy the Web app URL.
  3. Paste the URL into js/config.js as SHEETS_URL, then upload the folder to Netlify again.
  Until this is done, scores are kept safely on each device and sent automatically later.

GAME RULES
  3 stages, about 5 minutes: Spot the Problem (60 s, 30 pts), Fix the Layout (120 s, 40 pts),
  The Final Touch (75 s, 30 pts). Total 100. First attempt per Quizmas ID is the official score;
  replays are practice. Three flyer versions are given at random so neighbours cannot copy.

TESTING SWITCHES (for staff only)
  index.html?v=0, ?v=1, ?v=2   force flyer version (Carol Night, Talent Show, Toy Drive)
  index.html?fast=1            4-second stages, for quickly checking the flow

CREDITS
  Three.js (MIT), GSAP (GreenSock standard no-charge licence), SheetJS (Apache 2.0),
  fonts Baloo 2 and Nunito (SIL Open Font Licence), Mountains of Christmas (Apache 2.0).
  Glitch, flyer illustrations, sounds and music are original to this game.
