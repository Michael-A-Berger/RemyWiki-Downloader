// Getting the constants
const constants = require('./constants.js');

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
    const stringArray = str.split(/:\s+/g);
    if (stringArray.length > 1) {
      const propArray = stringArray[0].split('/');
      const valArray = stringArray[1].split(noCommaInParenthesesRegex);
      propArray.forEach((prop) => {
        const propName = prop.replace(/\W/g, '').toLowerCase();
        switch (propName) {
          case 'artist':
            song[propName] = valArray[0];
            break;
          default:
            song[propName] = valArray;
            break;
        }
        if (valArray.length === 1) {
          song[propName] = valArray[0];
        } else {
          song[propName] = valArray;
        }
      });
    }
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
