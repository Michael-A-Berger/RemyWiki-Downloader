// Getting the NPM modules
const axios = require('axios');
const cheerio = require('cheerio');

// Getting the other game modules (constants + tests)
const parser = require('./parser.js');
const gameTests = require('./game-tests.js');
const constants = require('./constants.js');
const printer = require('./printer.js');

// processFullSongListPage()
async function processFullSongListPage(url, version, debug = false) {
  console.log(`- Processing [${url}]...`);
  const pageScrapeWait = 120;
  // Parsing the song list page
  axios.get(url).then((response) => {
    // Loading the Cheerio JQuery object
    const loaded = cheerio.load(response.data);

    // Getting the main content div
    const contentDiv = loaded('div.mw-parser-output');

    // Getting every list item in the main content
    const listItems = contentDiv.find('li');
    for (let num = 0; num < listItems.length; num++) {
      const currentLI = listItems.eq(num);
      const previousH1 = currentLI.parent().prevAll('h1').eq(0);
      const href = currentLI.find('a').eq(0).attr('href');
      if (!href.startsWith('#') && previousH1.text().indexOf('LEGGENDARIA') === -1) {
        setTimeout(() => {
          parser.GetSong(`https://remywiki.com${href}`, version);
        }, pageScrapeWait * (num + 1));
      }
    }

    // TEST TEST TEST
    setTimeout(() => {
      if (gameTests.FullGameTest(parser.Songs, version)) {
        printer.PrintCSV(parser.Songs, version, true);
      }
    }, (pageScrapeWait * listItems.length) + (1000 * Math.ceil(listItems.length / 100)));
    // TEST TEST TEST
  });
}

// TEST TEST TEST
const gameVersion = constants.IIDXArcadeVersions[16];
const errorSongs = [
  'https://remywiki.com/HYPERION',
  'https://remywiki.com/B4U_(BEMANI_FOR_YOU_MIX)',
  'https://remywiki.com/Y%26Co._is_dead_or_alive',
];
let processCounter = 0;
errorSongs.forEach(async (url) => {
  await parser.GetSong(url, gameVersion, true);
  processCounter += 1;
  console.log(`- processCounter:\t${processCounter}`);
  if (processCounter > 2) {
    gameTests.ShortTest(parser.Songs, gameVersion);
    printer.PrintCSV(parser.Songs, gameVersion, true);
  }
});
// TEST TEST TEST

// processFullSongListPage('https://remywiki.com/DDRMAX2_Full_Song_List', constants.DDRArcadeVersions[14]);
// processFullSongListPage('https://remywiki.com/Beatmania_IIDX_6th_style_AC_full_song_list', constants.IIDXArcadeVersions[6]);
// processFullSongListPage('https://remywiki.com/Beatmania_IIDX_16_EMPRESS_AC_full_song_list', constants.IIDXArcadeVersions[16]);
// processFullSongListPage('https://remywiki.com/Beatmania_IIDX_26_Rootage_Full_Songlist', constants.IIDXArcadeVersions[26]);
// TEST TEST TEST
