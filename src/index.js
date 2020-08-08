// Getting the NPM modules
const axios = require('axios');
const cheerio = require('cheerio');

// Getting the other game modules (constants + tests)
const parser = require('./parser.js');
const gameTests = require('./game-tests.js');
const constants = require('./constants.js');
const printer = require('./printer.js');
const specialCases = require('./special-cases.js');

// getSong()
async function getSong(url, linkText, version, debug = false) {
  // Creating the song object
  const song = {};
  song.remywiki = url;

  // Debug Print
  if (debug) console.log(`- url:\t\t${url}\n- linkText:\t${linkText}\n- version:\t${version}`);

  // Waiting for the response data
  const response = await axios.get(url);

  // Loading the Cheerio JQuery instance
  const loaded = cheerio.load(response.data);

  // IF the song URL is NOT a special case...
  if (specialCases.SpecialCases.indexOf(url) === -1) {
    // Getting the song's English name (according to RemyWiki)
    const pageHeader = loaded('h1#firstHeading');
    song.engname = pageHeader.text();

    // Getting the song's (original) name
    const nameHeader = loaded('div.mw-parser-output > h1');
    song.name = nameHeader.text();

    // Checking for a big difference between the song page text and the link text
    let formattedLinkText = linkText.toLowerCase().replace(/[\s\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\-]*/g, '');
    let formattedSongName = song.name.toLowerCase().replace(/[\s\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\-]*/g, '');
    const regexLinkText = new RegExp(`[${formattedLinkText}]`, 'g');
    const regexSongName = new RegExp(`[${formattedSongName}]`, 'g');
    formattedLinkText = formattedLinkText.replace(regexSongName, '');
    formattedSongName = formattedSongName.replace(regexLinkText, '');
    if (formattedLinkText.length > 3 || formattedSongName.length > 3) {
      if (debug) console.log(`- LINK TEXT CHECK: [${song.name}] became [${linkText}]`);
      song.name = linkText;
    }

    // Getting the general song info
    let songInfo = loaded('#Song_Information').parent();
    songInfo = songInfo.nextAll('p').eq(0);
    const parsedInfo = parser.ParseSongInfo(songInfo, debug);
    Object.keys(parsedInfo).forEach((prop) => {
      song[prop] = parsedInfo[prop];
    });

    // Making sure the 'genre' property is filled in
    if (song.genre === undefined) {
      const genreKeys = Object.keys(song).filter((prop) => (prop.indexOf('genre') > -1));
      let keyToUse = '';
      if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
        keyToUse = genreKeys.filter((p) => p.indexOf('iidx'))[0];
        song.genre = song[keyToUse];
      }
      if (song.genre === undefined) {
        console.log(`ERROR IN PARSING: Song property 'genre' was not found in special cases! (${url})`);
      }
    }

    // Getting the other game apearances
    song.othermusicgameappearances = [];
    const firstUL = loaded('div.mw-parser-output > ul').first();
    const previousH2 = firstUL.prevAll('h2').first();
    const insideSpan = previousH2.find('span').first();
    if (insideSpan.attr('id') === 'Song_Information') {
      song.othermusicgameappearances = firstUL.text().split('\n');
    }

    // Debug Print
    if (debug) {
      console.log('\n~~~~~~~~~~ SONG BEFORE CHARTS ~~~~~~~~~~\n');
      console.dir(song);
      console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
    }

    // Getting the chart ratings
    song.charts = parser.GetCharts(loaded, version, debug);

    // IF there are still no charts, spit out an error
    if (song.charts.length === 0) {
      console.log(`- ERROR in [${song.engName}], no charts found for game [${version}]`);
    }

    // Debug Print (again)
    if (debug) console.dir(song);
  } else {
    // ELSE process the special case
    const specialSong = specialCases.ProcessSpecialCase(url, linkText, loaded, version, debug);
    const specialKeys = Object.keys();
    specialKeys.forEach((prop) => {
      song[prop] = specialSong[prop];
    });
    // song = specialCases.ProcessSpecialCase(url, linkText, loaded, version, debug);
    console.log(`- Special Case (${url}):`);
    console.dir(song);
  }

  // Adding the song to the big SONGS array
  parser.Songs.push(song);

  // Returning a promise (fulfilling 'await' conditions)
  return new Promise((resolve) => resolve());
}

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
      const firstA = currentLI.find('a').eq(0);
      const href = firstA.attr('href');
      if (!href.startsWith('#') && previousH1.text().indexOf('LEGGENDARIA') === -1) {
        setTimeout(() => {
          getSong(`https://remywiki.com${href}`, firstA.text(), version);
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
// const errorSong = 'https://remywiki.com/Timepiece_phase_II';
// const errorLinkText = 'Timepiece phase II (CN Ver.)';
// const errorSong2 = 'https://remywiki.com/1989';
// const errorLinkText2 = '1989';
// const gameVersion = constants.IIDXArcadeVersions[6];
// async function testFunc() {
//   await getSong(errorSong2, errorLinkText2, gameVersion, true);
//   gameTests.ShortTest(parser.Songs, gameVersion);
//   // printer.PrintCSV(parser.Songs, gameVersion, true);
// }
// testFunc();
// TEST TEST TEST

// processFullSongListPage('https://remywiki.com/DDRMAX2_Full_Song_List', constants.DDRArcadeVersions[14]);
processFullSongListPage('https://remywiki.com/Beatmania_IIDX_6th_style_AC_full_song_list', constants.IIDXArcadeVersions[6]);
// processFullSongListPage('https://remywiki.com/Beatmania_IIDX_16_EMPRESS_AC_full_song_list', constants.IIDXArcadeVersions[16]);
// processFullSongListPage('https://remywiki.com/Beatmania_IIDX_26_Rootage_Full_Songlist', constants.IIDXArcadeVersions[26]);
// TEST TEST TEST
