// Getting the constants
const constants = require('./constants.js');
const parser = require('./parser');

// Defining constant variables
const noCommaInParenthesesRegex = /,\s*(?![^\[\(]*[\]\)])/g;

// Defining the special case URLs
const specialCaseURLs = [
  'https://remywiki.com/IMPLANTATION',
];

// parseIMPLANTATION()
function parseIMPLANTATION(jqObj, version) {
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
     || constants.PopnArcadeVersions.indexOf(version) > -1) {
    // === WARNING === Also need to add beatmania + beatmania III checks
    songInfo = songInfo.nextAll('p').eq(1);
    getOtherGames = true;
  } else {
    // === WARNING === Need to add explicit GUITAR FREAKS + drummania checks
    songInfo = songInfo.nextAll('p').eq(0);
  }
  const infoStrings = songInfo.text().split('\n');
  infoStrings.forEach((str) => {
  const parsedInfo = parseSongInfo(songInfo, debug);
  Object.keys(parsedInfo).forEach((prop) => {
    song[prop] = parsedInfo[prop];
  });

  // Getting the other game apearances
  song.othermusicgameappearances = [];
  if (getOtherGames) {
    const firstUL = jqObj('div.mw-parser-output > ul').first();
    const previousH2 = firstUL.prevAll('h2').first();
    const insideSpan = previousH2.find('span').first();
    if (insideSpan.attr('id') === 'Song_Information') {
      song.othermusicgameappearances = firstUL.text().split('\n');
    }
  }

  // Returning the parsed IMPLANTATION song
  return song;
}

// parseTimepiecePhase2()
function parseTimepiecePhase2(jqObj, version) {
    
}

// processSpecialCase()
function processSpecialCase(url, jqObj, version) {
  // Defining the song to return
  let processedSong = {};

  // SWITCH for the special case
  switch (url) {
    case specialCaseURLs[0]:
      processedSong = parseIMPLANTATION(jqObj, version);
      break;
    default:
      console.log(`ERROR IN PARSING - No case for (${url}) in ProcessSpecialCase switch statement!`);
      break;
  }

  // Returning the processed song
  return processedSong;
}

// Setting up the exports
module.exports = {
  SpecialCases: specialCaseURLs,
  ProcessSpecialCase: processSpecialCase,
};
