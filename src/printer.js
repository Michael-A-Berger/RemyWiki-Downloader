// Base Node Packages
const fs = require('fs');

// Modules
const parser = require('./parser.js');
const constants = require('./constants.js');

// Defining the Comma Exception properties
const commaExceptionProperties = [
  'remywiki',
  'engname',
  'name',
  'artist',
];

// Getting the newline by OS
const newlineChar = (process.platform === 'win32' ? '\r\n' : '\n');

/* =================================
 * ===== SERIES HEADER METHODS =====
 * =================================
 */

function iidxHeaders(version) {
  // Defining the headers array
  const headers = {};

  // Setting the basic song properties
  headers.name = 'Name';
  headers.engname = 'Transliteral Name';
  headers.artist = 'Artist';
  headers.composition = 'Composition';
  headers.arrangement = 'Arrangement';
  headers.genre = 'Genre';
  headers.bpm = 'BPM';
  headers.length = 'Length';

  // Single Play Normal
  headers.spdifficultynormalrating = 'SPN Rating';
  headers.spdifficultynormalnotecounts = 'SPN Note Count';

  // Single Play Hyper
  headers.spdifficultyhyperrating = 'SPH Rating';
  headers.spdifficultyhypernotecounts = 'SPH Note Count';

  // Single Play Another
  headers.spdifficultyanotherrating = 'SPA Rating';
  headers.spdifficultyanothernotecounts = 'SPA Note Count';

  // Double Play Normal
  headers.dpdifficultynormalrating = 'DPN Rating';
  headers.dpdifficultynormalnotecounts = 'DPN Note Count';

  // Double Play Hyper
  headers.dpdifficultyhyperrating = 'DPH Rating';
  headers.dpdifficultyhypernotecounts = 'DPH Note Count';

  // Double Play Another
  headers.dpdifficultyanotherrating = 'DPA Rating';
  headers.dpdifficultyanothernotecounts = 'DPA Note Count';

  // IF the version is 10th style or greater...
  if (constants.IIDXArcadeVersions.indexOf(version) >= 10) {
    // Single Play Beginner
    headers.spdifficultybeginnerrating = 'Beginner Rating';
    headers.spdifficultybeginnernotecounts = 'Beginner Note Count';
  }

  // IF the version is 17 SIRIUS or greater...
  if (constants.IIDXArcadeVersions.indexOf(version) >= 17) {
    // Charge Notes
    headers.spdifficultybeginnerchargenotes = 'Beginner Charge Notes';
    headers.spdifficultynormalchargenotes = 'SPN Charge Notes';
    headers.spdifficultyhyperchargenotes = 'SPH Charge Notes';
    headers.spdifficultyanotherchargenotes = 'SPA Charge Notes';
    headers.dpdifficultynormalchargenotes = 'DPN Charge Notes';
    headers.dpdifficultyhyperchargenotes = 'DPH Charge Notes';
    headers.dpdifficultyanotherchargenotes = 'DPA Charge Notes';

    // Backspin Scratches
    headers.spdifficultybeginnerbackspinscratches = 'Beginner Backspin Scratches';
    headers.spdifficultynormalbackspinscratches = 'SPN Backspin Scratches';
    headers.spdifficultyhyperbackspinscratches = 'SPH Backspin Scratches';
    headers.spdifficultyanotherbackspinscratches = 'SPA Backspin Scratches';
    headers.dpdifficultynormalbackspinscratches = 'DPN Backspin Scratches';
    headers.dpdifficultyhyperbackspinscratches = 'DPH Backspin Scratches';
    headers.dpdifficultyanotherbackspinscratches = 'DPA Backspin Scratches';
  }

  // IF the version is 21 SPADA or greater...
  if (constants.IIDXArcadeVersions.indexOf(version) >= 21) {
    // Single Play Leggendaria
    headers.spdifficultyleggendariarating = 'SPL Rating';
    headers.spdifficultyleggendarianotecounts = 'SPL Note Count';
    headers.spdifficultyleggendariachargenotes = 'SPL Charge Notes';
    headers.spdifficultyleggendariabackspinscratches = 'SPL Backspin Scratches';

    // Double Play Leggendaria
    headers.dpdifficultyleggendariarating = 'DPL Rating';
    headers.dpdifficultyleggendarianotecounts = 'DPL Note Count';
    headers.dpdifficultyleggendariachargenotes = 'DPL Charge Notes';
    headers.dpdifficultyleggendariabackspinscratches = 'DPL Backspin Scratches';
  }

  // IF the version is 23 COPULA or greater...
  if (constants.IIDXArcadeVersions.indexOf(version) >= 23) {
    // Hell Charge Notes
    headers.spdifficultybeginnerhellchargenotes = 'Beginner Hell Charge Notes';
    headers.spdifficultynormalhellchargenotes = 'SPN Hell Charge Notes';
    headers.spdifficultyhyperhellchargenotes = 'SPH Hell Charge Notes';
    headers.spdifficultyanotherhellchargenotes = 'SPA Hell Charge Notes';
    headers.spdifficultyleggendariahellchargenotes = 'SPL Hell Charge Notes';
    headers.dpdifficultynormalhellchargenotes = 'DPN Hell Charge Notes';
    headers.dpdifficultyhyperhellchargenotes = 'DPH Hell Charge Notes';
    headers.dpdifficultyanotherhellchargenotes = 'DPA Hell Charge Notes';
    headers.dpdifficultyleggendariahellchargenotes = 'DPL Hell Charge Notes';

    // Hell Backspin Scratches
    headers.spdifficultybeginnerhellbackspinscratches = 'Beginner Hell Backspin Scratches';
    headers.spdifficultynormalhellbackspinscratches = 'SPN Hell Backspin Scratches';
    headers.spdifficultyhyperhellbackspinscratches = 'SPH Hell Backspin Scratches';
    headers.spdifficultyanotherhellbackspinscratches = 'SPA Hell Backspin Scratches';
    headers.spdifficultyleggendariahellbackspinscratches = 'SPL Hell Backspin Scratches';
    headers.dpdifficultynormalhellbackspinscratches = 'DPN Hell Backspin Scratches';
    headers.dpdifficultyhyperhellbackspinscratches = 'DPH Hell Backspin Scratches';
    headers.dpdifficultyanotherhellbackspinscratches = 'DPA Hell Backspin Scratches';
    headers.dpdifficultyleggendariahellbackspinscratches = 'DPL Hell Backspin Scratches';
  }

  // Other misc. properties
  headers.firstmusicgameappearance = 'First Music Game Appearance';
  headers.othermusicgameappearances = 'Other Music Game Appearances';
  headers.vj = 'Video Jockey';
  headers.remywiki = 'RemyWiki Link';

  // Returning the header array
  return headers;
}

/* ===========================
 * ===== GENERIC METHODS =====
 * ===========================
 */

// songsToShallowArray()
function songsToShallowArray(songList, debug = false) {
  // Defining the shallow string array
  const shallowArray = [];

  // FOREACH song in the song list
  songList.forEach((song) => {
    // Defining the flat song property
    const flatSong = {};

    // Getting the song properties (except charts)
    const songProps = Object.keys(song);
    const chartsIndex = songProps.indexOf('charts');
    songProps.splice(chartsIndex, 1);

    // FOREACH song property
    songProps.forEach((property) => {
      // Setting the property value to the shallow copy (works for arrays + strings)
      flatSong[property] = song[property].toString();
      // if (property !== 'remywiki') {
      if (commaExceptionProperties.indexOf(property) === -1) {
        flatSong[property] = flatSong[property].replace(parser.NoCommaInParenthesesRegex, ', ');
      }
    });

    // Dealing with the charts
    const chartNames = Object.keys(song.charts);
    chartNames.forEach((name) => {
      // Iterating through the chart properties
      const chartProps = Object.keys(song.charts[name]);
      chartProps.forEach((prop) => {
        // Combining the name + prop on the shallow copy
        flatSong[name + prop] = song.charts[name][prop];
      });
    });

    // Debug Print
    if (debug) {
      console.log(`\n- Song (${song.remywiki}) flattened:`);
      console.dir(flatSong);
    }

    // Adding the flat song to the shallow array
    shallowArray.push(flatSong);
  });

  // Returning the shallow string array
  return shallowArray;
}

// printCSV()
function printCSV(songList, version, debug = false) {
  // Flattening the JSON objects
  const songsForPrint = songsToShallowArray(songList, false);

  // Debug Print
  if (debug) {
    const uniqueProps = [];
    songsForPrint.forEach((song) => {
      const newProps = Object.keys(song).filter((p) => !uniqueProps.includes(p));
      newProps.forEach((p) => uniqueProps.push(p));
    });
    uniqueProps.sort();
    console.log('- uniqeProps:');
    for (let num = 0; num < uniqueProps.length; num++) {
      let numString = num.toString();
      switch (numString.length) {
        case 1:
          numString = `00${numString}`;
          break;
        case 2:
          numString = `0${numString}`;
          break;
        default:
          // Do nothing
          break;
      }
      console.log(`\t${numString} - ${uniqueProps[num]}`);
    }
  }

  // Getting the appropriate headers
  let headers = {};
  if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
    headers = iidxHeaders(version);
  }

  // Throwing out an error if the headers have not been defined
  if (headers === undefined || headers.length < 1) {
    console.log(`ERROR IN PRINTING - Headers not defined! (Version: ${version})`);
  }

  // Creating the write stream
  const fileName = `${version.toLowerCase().replace(/\s+/g, '-')}.csv`;
  const writeStream = fs.createWriteStream(fileName);

  // Formatting the header string for the CSV file
  let headerString = '';
  const headerKeys = Object.keys(headers);
  for (let num = 0; num < headerKeys.length; num++) {
    headerString += headers[headerKeys[num]];
    if (num < headerKeys.length - 1) headerString += ',';
  }

  // Debug Print
  if (debug) {
    console.log('\n- headerKeys:');
    console.dir(headerKeys);
  }

  // Writing the header string to the CSV fiile
  writeStream.write(headerString + newlineChar, 'utf8', (error) => {
    if (error) console.log(error);
    else {
      // ELSE FOREACH song, format + write it
      songsForPrint.forEach((song) => {
        if (debug) console.log(`- Processing [${song.remywiki}]...`);
        let songString = '';
        for (let num = 0; num < headerKeys.length; num++) {
          let property = '';
          if (song[headerKeys[num]] !== undefined) {
            property = `${song[headerKeys[num]]}`;
            if (property.indexOf(',') > -1) property = `"${property}"`;
          }
          songString += property;
          if (num < headerKeys.length - 1) songString += ',';
        }
        writeStream.write(songString + newlineChar, 'utf8', (err) => {
          if (err) console.log(err);
        });
      });
    }
  });

  // When the write stream has finished successfully, tell the user
  writeStream.on('finish', () => {
    console.log('\n- Finished writing songs to [output.csv].\n');
  });
}

// Setting up the exports
module.exports = {
  PrintCSV: printCSV,
};
