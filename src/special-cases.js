// Getting the constants
const constants = require('./constants.js');
const parser = require('./parser.js');

// Defining the special case URLs
const specialCaseURLs = [
  'https://remywiki.com/IMPLANTATION',
  'https://remywiki.com/Timepiece_phase_II',
];

// parseIMPLANTATION()
function parseIMPLANTATION(jqObj, version, debug = false) {
  // Special variables
  const song = {};
  let getOtherGames = false;

  // Getting the song's English name (according to RemyWiki)
  const pageHeader = jqObj('h1#firstHeading');
  song.engname = pageHeader.text();

  // Getting the song's (original) name
  const nameHeader = jqObj('div.mw-parser-output > h1');
  song.name = nameHeader.text();

  // Getting the general song info
  let songInfo = jqObj('#Song_Information').parent();
  if (constants.IIDXArcadeVersions.indexOf(version) > -1
     || constants.PopnArcadeVersions.indexOf(version) > -1
     || constants.IIDXConsoleVersions.indexOf(version) > -1) {
    // === WARNING === Also need to add beatmania + beatmania III checks
    songInfo = songInfo.nextAll('p').eq(1);
    getOtherGames = true;
  } else {
    // === WARNING === Need to add explicit GUITAR FREAKS + drummania checks
    songInfo = songInfo.nextAll('p').eq(0);
  }
  const parsedInfo = parser.ParseSongInfo(song, songInfo, debug);
  Object.keys(parsedInfo).forEach((prop) => {
    song[prop] = parsedInfo[prop];
  });

  // IF we're getting the IIDX/Pop'n version, get the other game appearances
  song.othermusicgameappearances = [];
  if (getOtherGames) {
    const firstUL = jqObj('div.mw-parser-output > ul').first();
    const previousH2 = firstUL.prevAll('h2').first();
    const insideSpan = previousH2.find('span').first();
    if (insideSpan.attr('id') === 'Song_Information') {
      song.othermusicgameappearances = firstUL.text().split('\n');
    }
  }
  
  // IF we're getting a beatmania (OG, IIDX, or III) version, set the VJ to Movie
  if (constants.IIDXArcadeVersions.indexOf(version) > -1
     || constants.IIDXConsoleVersions.indexOf(version) > -1) {
    song.vj = song.movie;
  }

  // Debug Print
  if (debug) {
    console.log('\n~~~~~~~~~~ SONG BEFORE CHARTS ~~~~~~~~~~\n');
    console.dir(song);
    console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
  }

  // Getting the chart ratings
  song.charts = parser.GetCharts(jqObj, version);

  // IF there are still no charts, spit out an error
  if (song.charts.length === 0) {
    console.log(`- ERROR in [${song.engName}], no charts found for game [${version}]`);
  }

  // Debug Print (again)
  if (debug) console.dir(song);

  // Returning the parsed IMPLANTATION song
  return song;
}

// parseTimepiecePhase2()
function parseTimepiecePhase2(linkText, jqObj, version, debug = false) {
  // Special variables
  const song = {};

  // Getting the song's English name (according to RemyWiki)
  const pageHeader = jqObj('h1#firstHeading');
  song.engname = pageHeader.text();

  // Getting the song's (original) name
  const nameHeader = jqObj('div.mw-parser-output > h1');
  song.name = nameHeader.text();

  // Getting the general song info
  let songInfo = jqObj('#Song_Information').parent();
  songInfo = songInfo.nextAll('p').eq(0);
  const parsedInfo = parser.ParseSongInfo(song, songInfo, debug);
  Object.keys(parsedInfo).forEach((prop) => {
    song[prop] = parsedInfo[prop];
  });

  // Setting the VJ to be the movie
  song.vj = song.movie;

  // Getting the other game appearances
  song.othermusicgameappearances = [];
  const firstUL = jqObj('div.mw-parser-output > ul').first();
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

  // IF the IIDX CN charts are requested, get those
  const formattedLinkText = linkText.toLowerCase().replace(/\s*/g, '');
  if (constants.IIDXArcadeVersions.indexOf(version) > -1 && formattedLinkText.indexOf('cnver') > -1) {
    // Getting the charge note chart table
    const chargeNoteChartHeader = jqObj('h4:contains(CN Ver. Charts)');
    const chargeTable = chargeNoteChartHeader.nextAll('table').eq(0);
    const chartTable2D = parser.TableToArray(chargeTable);

    // Getting the index to use
    let indexToUse = -1;
    for (let num = 0; num < chartTable2D.length; num++) {
      if (chartTable2D[num][0] === version) {
        indexToUse = num;
        num = chartTable2D.length;
      }
    }
    if (indexToUse === -1) {
      indexToUse = parser.GetTableRowPastIndex(chartTable2D, version, debug);
    }

    // Processing the chart row (if it exists)
    const chartHolder = parser.ParseChartTableRow(chartTable2D, indexToUse);
    const chartKeys = Object.keys(chartHolder);
    song.charts = {};
    chartKeys.forEach((chartName) => {
      song.charts[chartName] = chartHolder[chartName];
    });
  } else {
    // ELSE just get the normal game charts
    song.charts = parser.GetCharts(jqObj, version);
  }

  // IF there are still no charts, spit out an error
  if (song.charts.length === 0) {
    console.log(`- ERROR in [${song.engName}], no charts found for game [${version}]`);
  }

  // Debug Print (again)
  if (debug) console.dir(song);

  // Returning the parsed IMPLANTATION song
  return song;
}

// processSpecialCase()
function processSpecialCase(url, linkText, jqObj, version, debug = false) {
  // Defining the song to return
  let processedSong = {};

  // SWITCH for the special case
  switch (url) {
    case specialCaseURLs[0]:
      processedSong = parseIMPLANTATION(jqObj, version, debug);
      break;
    case specialCaseURLs[1]:
      processedSong = parseTimepiecePhase2(linkText, jqObj, version, debug);
      break;
    default:
      console.log(`ERROR IN PARSING - No case for (${url}) in ProcessSpecialCase switch statement!`);
      break;
  }

  // Setting the passed RemyWiki link to the processed song
  processedSong.remywiki = url;

  // Returning the processed song
  return processedSong;
}

// Setting up the exports
module.exports = {
  SpecialCases: specialCaseURLs,
  ProcessSpecialCase: processSpecialCase,
};
