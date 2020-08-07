// Packages
const csv = require('fast-csv');


// Modules
const constants = require('./constants.js');

/* =================================
 * ===== SERIES HEADER METHODS =====
 * =================================
 */

function iidxHeaders(flattenedList, debug) {
  // Gathering all of the unique properties from the flattened song list
  let uniqueProps = [ 'remywiki' ];
  flattenedList.forEach((song) => {
    let newProps = Object.keys(song).filter((p) => !uniqueProps.includes(p));
    newProps.forEach((p) => uniqueProps.push(p));
    if (debug) console.log('song processed');
  });
  
  // Debug Print
  if (debug) {
    console.log('- uniqeProps:');
    console.dir(uniqueProps);
  }
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
  let songsForPrint = songsToShallowArray(songList, debug);
  
  // Getting the appropriate headers
  let headers = [];
  if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
    headers = iidxHeaders(songsForPrint, debug);
  }
  
  // Throwing out an error if the headers have not been defined
  if (headers === undefined || headers.length < 1) {
    console.log(`ERROR IN PRINTING - Headers not defined! (Version: ${version})`);
  }
}

// Setting up the exports
module.exports = {
  PrintCSV: printCSV,
};
