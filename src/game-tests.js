// Getting the constants module
const constants = require('./constants.js');

// Defining the chart types per series
const iidxArcadeChartTypes = [
  'spdifficultybeginner',
  'spdifficultynormal',
  'spdifficultyhyper',
  'spdifficultyanother',
  'spdifficultyleggendaria',
  'dpdifficultynormal',
  'dpdifficultyhyper',
  'dpdifficultyanother',
  'dpdifficultyleggendaria',
];

/* =====================================
 * ===== PROPERTY CHECK EXCEPTIONS =====
 * =====================================
 */

const compositionExceptions = [
  'https://remywiki.com/REAL_LOVE',
];

const arrangementExceptions = [
  'https://remywiki.com/REAL_LOVE',
  'https://remywiki.com/FANTASY',
  'https://remywiki.com/JIVE_INTO_THE_NIGHT',
];

/* ================================
 * ===== GENERIC TEST METHODS =====
 * ================================
 */

// songTest()
function songTest(song) {
  // Defining the result
  let passedTest = true;

  // Error Checking - Basic Properties
  if (song.remywiki === undefined) {
    console.log('!!! - Song has no RemyWiki link! Full song details:');
    console.dir(song);
    passedTest = false;
  }
  if (song.engname === undefined || typeof song.engname !== 'string') {
    console.log(`!!! - Song has no English Name! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.name === undefined || typeof song.name !== 'string') {
    console.log(`!!! - Song has no proper name! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.artist === undefined) {
    console.log(`!!! - Song has no artist! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.bpm === undefined) {
    console.log(`!!! - Song has no 'bpm' property! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.length === undefined) {
    console.log(`!!! - Song has no 'length' property! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.firstmusicgameappearance === undefined) {
    console.log(`!!! - Song has no 'firstmusicgameappearance' property! (${song.remywiki})`);
    passedTest = false;
  }

  // Returning the result
  return passedTest;
}

// iidxChartTest()
function iidxChartTest(song, chartName) {
  // Getting the chart to test
  const chart = song.charts[chartName];

  // Defining the result
  let passedTest = true;

  // Error Checking - Basic Properties
  if (chart.rating === undefined) {
    console.log(`!!! - Song chart [${chartName}] has no 'rating' property! [${song.remywiki}]`);
    passedTest = false;
  }
  if (chart.notecounts === undefined) {
    console.log(`!!! - Song chart [${chartName}] has no 'notecounts' property! [${song.remywiki}]`);
    passedTest = false;
  }

  // Error Checking - Property Types
  if (typeof chart.notecounts !== 'number') {
    console.log(`!!! - Song chart [${chartName}] 'notecounts' property is not a number! [${song.remywiki}]`);
    passedTest = false;
  }
  if (chart.chargenotes !== undefined && typeof chart.chargenotes !== 'number') {
    console.log(`!!! - Song chart [${chartName}] 'chargenotes' property is not a number! [${song.remywiki}]`);
    passedTest = false;
  }
  if (chart.backspinscratches !== undefined && typeof chart.backspinscratches !== 'number') {
    console.log(`!!! - Song chart [${chartName}] 'backspinscratches' property is not a number! [${song.remywiki}]`);
    passedTest = false;
  }
  if (!passedTest) console.dir(chart);

  // Returning the result
  return passedTest;
}

// iidxSongTest()
function iidxSongTest(song) {
  // Defining the result
  let passedTest = songTest(song);
  let chartTest = false;

  // Error Checking - Basic IIDX Properties
  if (song.genre === undefined) {
    console.log(`!!! - Song has no 'genre' property! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.composition === undefined && compositionExceptions.indexOf(song.remywiki) === -1) {
    console.log(`!!! - Song has no 'composition' property! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.arrangement === undefined && arrangementExceptions.indexOf(song.remywiki) === -1) {
    console.log(`!!! - Song has no 'arrangement' property! (${song.remywiki})`);
    passedTest = false;
  }
  if (song.vj === undefined) {
    console.log(`!!! - Song has no 'vj' property! (${song.remywiki})`);
    passedTest = false;
  }

  // Error Checking - Chart Amount
  const chartKeys = Object.keys(song.charts);
  if (chartKeys.length === 0) {
    console.log(`!!! - Song has no charts! (${song.remywiki})`);
    passedTest = false;
  }

  // Error Checking - Individual Charts
  chartKeys.forEach((chart) => {
    if (iidxArcadeChartTypes.indexOf(chart) === -1) {
      console.log(`!!! - Song has unrecognized '${chart}' chart! (${song.remywiki})`);
      passedTest = false;
    } else {
      chartTest = iidxChartTest(song, chart);
      passedTest = passedTest && chartTest;
    }
  });

  // Returning the result
  return passedTest;
}

/* ============================
 * ===== DDR TEST METHODS =====
 * ============================
 */

// ddrTestMax2()
function ddrTestMax2(songList) {
  let noErrors = true;
  let newSongs = 0;
  let chartCount = 0;
  // Error Checking - Total Song Count
  if (songList.length !== 135) {
    console.log(`!!! - Song list size is wrong! (Size: ${songList.length}, expected 135)`);
    noErrors = false;
  }
  songList.forEach((song) => {
    // Song Checking
    noErrors = noErrors && songTest(song);

    // Error Checking - New Song
    const gameName = 'DDRMAX2 -DanceDanceRevolution 7thMIX-';
    if (song.firstmusicgameappearance.indexOf(gameName) > -1
       || song.othermusicgameappearances.indexOf(gameName) > -1) {
      newSongs++;
    }

    // Error Checking - Chart Count
    chartCount = Object.keys(song.charts);
    if (chartCount.length !== 2 && chartCount.length !== 6
        && song.engname !== 'Kakumei' && song.engname !== 'BRILLIANT 2U') {
      console.log(`!!! - Song [${song.engname}] has ${chartCount.length} charts!\n`);
      noErrors = false;
    }
  });
  if (newSongs !== 53) {
    console.log(`!!! - New Songs count is wrong! (Count: ${newSongs}, expected 53)`);
    noErrors = false;
  }
  if (noErrors) console.log('\n~~~ Clean MAX2 Song Rip ~~~\n');
  return noErrors;
}

/* =============================
 * ===== IIDX TEST METHODS =====
 * =============================
 */

// 6th Style
function iidxTest6thStyle(songList) {
  let noErrors = true;
  let iidxTest = false;
  const gameName = 'beatmania IIDX 6th style';
  let newSongs = 0;
  // Error Checking - Total Song Count
  if (songList.length !== 133) {
    console.log(`!!! - Song list size is wrong! (Size: ${songList.length}, expected 133)`);
    noErrors = false;
  }
  songList.forEach((song) => {
    // Song Checking
    iidxTest = iidxSongTest(song);
    noErrors = noErrors && iidxTest;

    // Counting the new songs
    if (song.firstmusicgameappearance.indexOf(gameName) > -1
       || song.othermusicgameappearances.indexOf(gameName) > -1) {
      newSongs++;
    }
  });
  // Error Checking - New Song
  if (newSongs !== 39) {
    console.log(`!!! - New Songs count is wrong! (Count: ${newSongs}, expected 39)`);
    noErrors = false;
  }
  if (noErrors) console.log('\n~~~ Clean 6th Style Song Rip ~~~\n');
  return noErrors;
}

// 16 Empress
function iidxTest16Empress(songList) {
  let noErrors = true;
  let iidxTest = false;
  const gameName = 'beatmania IIDX 16 EMPRESS';
  let newSongs = 0;
  // Error Checking - Total Song Count
  if (songList.length !== 533) {
    console.log(`!!! - Song list size is wrong! (Size: ${songList.length}, expected 533)`);
    noErrors = false;
  }
  songList.forEach((song) => {
    // Song Checking
    iidxTest = iidxSongTest(song);
    noErrors = noErrors && iidxTest;

    // Counting the new songs
    if (song.firstmusicgameappearance.indexOf(gameName) > -1
       || song.othermusicgameappearances.indexOf(gameName) > -1) {
      newSongs++;
    }
  });
  // Error Checking - New Song
  if (newSongs !== 54) {
    console.log(`!!! - New Songs count is wrong! (Count: ${newSongs}, expected 54)`);
    noErrors = false;
  }
  if (noErrors) console.log('\n~~~ Clean 16 EMPRESS Song Rip ~~~\n');
  return noErrors;
}

// 26 Rootage
function iidxTest26Rootage(songList) {
  let noErrors = true;
  let iidxTest = false;
  const gameName = 'beatmania IIDX 26 Rootage';
  let newSongs = 0;
  // Error Checking - Total Song Count
  if (songList.length !== 1261) {
    console.log(`!!! - Song list size is wrong! (Size: ${songList.length}, expected 1261)`);
    noErrors = false;
  }
  songList.forEach((song) => {
    try {
      // Song Checking
      iidxTest = iidxSongTest(song);
      noErrors = noErrors && iidxTest;

      // Counting the new songs
      if (song.firstmusicgameappearance.indexOf(gameName) > -1
         || song.othermusicgameappearances.indexOf(gameName) > -1) {
        newSongs++;
      }
    } catch (e) {
      console.log(e);
      console.dir(song);
    }
  });
  // Error Checking - New Song
  if (newSongs !== 110) {
    console.log(`!!! - New Songs count is wrong! (Count: ${newSongs}, expected 110)`);
    noErrors = false;
  }
  if (noErrors) console.log('\n~~~ Clean 26 Rootage Song Rip ~~~\n');
  return noErrors;
}

/* =============================
 * ===== SHORT TEST METHOD =====
 * =============================
 */

function shortTest(songList, version) {
  // Defining the booleans
  let result = true;
  let testHappened = false;

  // IF the version is IIDX, do those tests
  if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
    songList.forEach((song) => {
      const test = iidxSongTest(song);
      result = result && test;
    });
    testHappened = true;
  }

  // IF the test did not happen, complain about it
  if (!testHappened) {
    console.log(`=== ERROR ===\n\n- No short test method for [${version}]\n`);
  }

  // Returning the test result
  return result;
}

/* ============================
 * ===== FULL TEST METHOD =====
 * ============================
 */

function fullGameTest(songList, version) {
  // Defining the booleans
  let result = true;
  let testHappened = false;

  // DDR Testing
  if (constants.DDRArcadeVersions.indexOf(version) > -1) {
    switch (version) {
      case constants.DDRArcadeVersions[14]: // MAX2
        result = ddrTestMax2(songList);
        testHappened = true;
        break;
      default:
        // Do nothing, will get caught later in method
        break;
    }
  }

  // IIDX Testing
  if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
    switch (version) {
      case constants.IIDXArcadeVersions[6]: // 6th Style
        result = iidxTest6thStyle(songList);
        testHappened = true;
        break;
      case constants.IIDXArcadeVersions[16]: // 16 Empress
        result = iidxTest16Empress(songList);
        testHappened = true;
        break;
      case constants.IIDXArcadeVersions[26]: // 26 Rootage
        result = iidxTest26Rootage(songList);
        testHappened = true;
        break;
      default:
        // Do nothing, will get caught later in method
        break;
    }
  }

  // IF the test did not happen, say so
  if (!testHappened) {
    console.log(`=== ERROR ===\n\n- No full game test method for [${version}]\n`);
  }

  // Returning the test result
  return result;
}

// Setting up the exports
module.exports = {
  ShortTest: shortTest,
  FullGameTest: fullGameTest,
};
