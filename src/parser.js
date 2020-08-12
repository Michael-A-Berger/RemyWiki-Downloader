// Getting other downloader modules
const constants = require('./constants.js');

// Const Variables
const songs = [];
const noCommaInParenthesesRegex = /,\s*(?![^\[\(]*[\]\)])/g;
const textInsideParenthesesRegex = /(?<=\().*?(?=\))/g;
const textAndParenthesesRegex = /\(.*\)/g;

const allowArrayParsing = false;

// printTableArray()
function printTableArray(table) {
  const printElementLength = 6;
  let str = '';
  for (let row = 0; row < table.length; row++) {
    str = '[\xa0\xa0';
    for (let col = 0; col < table[row].length; col++) {
      let snippet = table[row][col];
      if (snippet.length > printElementLength) snippet = snippet.substr(snippet.length - printElementLength);
      str += `(${snippet})`;
      while (str.length < 3 + (printElementLength + 2) * (col + 1)) {
        str += '\xa0';
      }
    }
    str += '\xa0\xa0]';
    console.log(str);
  }
}

// tableToArray()
function tableToArray(tableObj) {
  // Getting the table rows
  const tableRows = tableObj.find('tr');

  // Defining the return array
  const table2D = [];
  for (let num = 0; num < tableRows.length; num++) table2D[num] = [];

  // Getting the table as a 2D array
  for (let rowNum = 0; rowNum < tableRows.length; rowNum++) {
    const currentRow = tableRows.eq(rowNum);

    // Figuring out which cell type ('th' or 'td') is being used
    const thCells = currentRow.find('th');
    const tdCells = currentRow.find('td');
    let cells;
    if (thCells.length > 0) cells = thCells;
    if (tdCells.length > 0) cells = tdCells;
    // Processing the cells in the current row
    for (let cellNum = 0; cellNum < cells.length; cellNum++) {
      const currentCell = cells.eq(cellNum);

      // Getting the rowspan and colspan properties of the cell
      let rowspan = parseInt(currentCell.attr('rowspan'), 10);
      let colspan = parseInt(currentCell.attr('colspan'), 10);

      // Correcting for undefined properties
      if (Number.isNaN(rowspan)) rowspan = 1;
      if (Number.isNaN(colspan)) colspan = 1;

      // Setting the cells of the 2D array
      for (let y = 0; y < rowspan; y++) {
        for (let x = 0; x < colspan; x++) {
          table2D[rowNum + y].push(currentCell.text().replace(/\n/g, ''));
        }
      }
    }
  }

  // Returning the table array
  return table2D;
}

// styleTextIsRelevant()
function styleTextIsRelevant(version, styleText, debug = false) {
  // Defining the result variable
  let result = false;

  // Getting the full series from the current version
  const fullSeries = constants.GetSeries(version);

  // Getting the two parts of the style text string
  let startIndex = -1;
  let endIndex = -1;
  const styleArray = styleText.split('→');

  // Determining if the style text strings correspond to game versions in the full series
  startIndex = fullSeries.indexOf(styleArray[0]);
  for (let num = 0; startIndex < 0 && num < fullSeries.length; num++) {
    if (fullSeries[num].indexOf(styleArray[0]) > -1) {
      startIndex = num;
    }
  }
  if (styleArray.length > 1) {
    if (styleArray[1].toLowerCase() === 'present') {
      endIndex = fullSeries.length;
    }
    for (let styleNum = 0; endIndex === -1 && styleNum < fullSeries.length; styleNum++) {
      if (fullSeries[styleNum].indexOf(styleArray[1]) > -1) endIndex = styleNum;
    }
  } else {
    endIndex = startIndex;
  }

  // Determining whether the current version is within the style range
  const currentIndex = fullSeries.indexOf(version);
  if (startIndex !== -1 && currentIndex !== -1 && endIndex !== -1) {
    result = (startIndex <= currentIndex && currentIndex <= endIndex);
    if (debug) console.log(`\tstartIndex: ${startIndex}\n\tcurrentIndex: ${currentIndex}\n\tendIndex: ${endIndex}`);
  }

  // Returning the result
  return result;
}

// getTableRowPastIndex()
function getTableRowPastIndex(chartTable, currentVersion, debug = false) {
  // Defining the past index variable
  let pastIndex = -1;

  // Doing a preliminary "First Mix+" check
  for (let num = 0; num < chartTable.length; num++) {
    if (chartTable[num][0].startsWith(`${currentVersion}→`)) {
      pastIndex = num;
    }
  }

  // FOR each row of the table (going backwards)...
  for (let rowNum = chartTable.length - 1; pastIndex === -1 && rowNum > -1; rowNum--) {
    // IF the current row is relevant to the current game version, set the past index to the row number
    if (styleTextIsRelevant(currentVersion, chartTable[rowNum][0], debug)) {
      pastIndex = rowNum;
      // Debug Print
      if (debug) {
        console.log(`\n~~~~~~~~~~ PAST INDEX CURRENT ROW (#${rowNum}) ~~~~~~~~~~\n`);
        console.dir(chartTable[rowNum]);
        console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
      }
    }
  }

  // Returning the past index
  return pastIndex;
}

// parseChartTableRow()
function parseChartTableRow(chartTable2D, rowIndex) {
  // Defining the chart holder
  const holder = {};

  // Getting the column count
  const colCount = chartTable2D[0].length;

  // Calculating the chart stats names in advance
  let chartStatNames = chartTable2D[2][0].replace(/\s*/g, '').split('/');
  chartStatNames = chartStatNames.map((name) => name.toLowerCase());

  // FOR each column past the first one...
  for (let col = 1; col < colCount; col++) {
    // IF the column in the row has a valid chart...
    const chartRating = chartTable2D[rowIndex][col].replace(/[^\w/\+]/g, '');
    if (chartRating.length > 0) {
      // Getting the chart name + stats
      const currentChart = {};
      let chartName = chartTable2D[0][col].replace(/\s/g, '').toLowerCase();
      chartName += chartTable2D[1][col].replace(/\s/g, '').toLowerCase();
      let chartStats = chartTable2D[2][col].replace(/\s/g, '').toLowerCase();
      chartStats = chartStats.split('/');
      for (let n = 0; n < chartStats.length; n++) chartStats[n] = parseInt(chartStats[n], 10);

      // Accounting for the mising note data
      while (chartStats.length < chartStatNames.length) chartStats.push(0);

      // Putting the chart data onto the current chart object
      currentChart.rating = chartRating;
      // currentChart.rating = parseInt(currentChart.rating, 10);
      for (let n = 0; n < chartStatNames.length; n++) {
        currentChart[chartStatNames[n]] = chartStats[n];
      }

      // Putting the individual chart on the charts object
      holder[chartName] = currentChart;
    }
  }

  // Returning the row values object
  return holder;
}

// getCharts()
function getCharts(jqObj, version, debug = false) {
  // Defining the charts array + use index variable
  const charts = {};
  let indexToUse = -1;

  // Deciding which chart header to get + Which game series versions array to use
  let chartHeaderID = '';
  if (constants.DDRArcadeVersions.indexOf(version) > -1) {
    chartHeaderID = '#DanceDanceRevolution';
  }
  if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
    chartHeaderID = '#beatmania_IIDX';
  }

  // IF no designated chart header was found, throw an error
  if (chartHeaderID === '') {
    console.log(`CHART PARSE ERROR - No IF statement in getCharts() for [${version}]`);
  }

  // Getting the game chart header
  let gameChartsHeader = jqObj(chartHeaderID);
  if (gameChartsHeader.length > 0) gameChartsHeader = gameChartsHeader.parent();
  else gameChartsHeader = jqObj('span:contains(Difficulty & Notecounts)').parent();
  const gameChartsTables = gameChartsHeader.nextAll('table');

  // Defining the table 2D array
  let chartTable2D = [];

  // FOR each table found after the header...
  for (let chartNum = 0; indexToUse < 0 && chartNum < gameChartsTables.length; chartNum++) {
    // Defining the table 2D array
    chartTable2D = tableToArray(gameChartsTables.eq(chartNum));
    if (debug) printTableArray(chartTable2D);

    // Looking for an EXACT chart row match
    let exactIndex = -1;
    for (let num = 0; num < chartTable2D.length; num++) {
      if (chartTable2D[num][0] === version) {
        exactIndex = num;
        num = chartTable2D.length;
      }
    }

    // Looking for a PAST chart row match
    const pastIndex = getTableRowPastIndex(chartTable2D, version, debug);

    // Deciding which table row index to start getting the chart with
    if (exactIndex > -1) indexToUse = exactIndex;
    if (pastIndex > -1) indexToUse = pastIndex;
    if (debug) {
      console.log('\n~~~~~~~~~~ TABLE ROW INDEXES ~~~~~~~~~~\n');
      console.log(`- exactIndex:\t${exactIndex}\n- pastIndex:\t${pastIndex}`);
      console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
    }
  }

  // Processing the chart row (if it exists)
  if (indexToUse > -1) {
    const chartHolder = parseChartTableRow(chartTable2D, indexToUse);
    const chartKeys = Object.keys(chartHolder);
    chartKeys.forEach((chartName) => {
      charts[chartName] = chartHolder[chartName];
    });
  }

  // Returning the charts array
  return charts;
}

// cleanArrayToString()
function cleanArrayToString(url, property, version, propArray, debug) {
  // Defining the result + check passed variable
  let result;
  let checkPassed = false;

  // beatmania IIDX Checks
  if (!checkPassed && constants.IIDXArcadeVersions.indexOf(version) > -1) {
    // Difficulty Check
    const diffArray = ['beginner', 'normal', 'hyper', 'another', 'leggendaria'];
    for (let num = 0; !checkPassed && num < propArray.length; num++) {
      for (let diffNum = 0; !checkPassed && diffNum < diffArray.length; diffNum++) {
        if (propArray[num].toLowerCase().indexOf(diffArray[diffNum]) > -1) {
          result = propArray;
          checkPassed = true;
        }
      }
    }

    // Series check
    const keyToUse = propArray.filter((p) => (p.toLowerCase().indexOf('iidx') > -1));
    if (!checkPassed && keyToUse.length === 1) {
      const parenMatches = keyToUse[0].match(textAndParenthesesRegex);
      if (parenMatches !== null && parenMatches.length > 0) {
        result = keyToUse[0].replace(parenMatches[parenMatches.length - 1], '').trim();
        checkPassed = true;
      }
    }
  }

  // Checking the Game Style
  for (let num = 0; !checkPassed && num < propArray.length; num++) {
    const parenMatches = propArray[num].match(textInsideParenthesesRegex);
    if (parenMatches !== null) {
      for (let parenNum = 0; !checkPassed && parenNum < parenMatches.length; parenNum++) {
        const parenSplit = parenMatches[parenNum].split(/\s*,\s*/g);
        for (let splitNum = 0; !checkPassed && splitNum.length; splitNum++) {
          if (styleTextIsRelevant(version, parenSplit[splitNum], debug)) {
            result = propArray[num].replace(parenMatches[parenNum], '').trim();
            checkPassed = true;
          }
        }
      }
    }
  }

  // IF the check has not been passed, complain about it
  if (!checkPassed) {
    console.log(`ERROR IN PARSING: Song property '${property}' is still an array despite special processing! ${url}`);
  }

  // Returning the result
  return result;
}

// cleanUpSongInfo()
function cleanUpSongInfo(songInfo, version, debug = false) {
  // Defining the info copy object
  const infoCopy = { ...songInfo };

  // Undefined Parsing - Genre
  if (infoCopy.genre === undefined) {
    const genreKeys = Object.keys(infoCopy).filter((prop) => (prop.indexOf('genre') > -1));
    let keyToUse = [];
    // beatmania IIDX
    if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
      keyToUse = genreKeys.filter((p) => p.indexOf('iidx') > -1);
      if (keyToUse.length === 1) infoCopy.genre = infoCopy[keyToUse[0]];
    }
    // IF no undefined parsing was done, say so
    if (infoCopy.genre === undefined) {
      console.log(`ERROR IN PARSING: Song property 'genre' was not found in special cases! (${infoCopy.remywiki})`);
    }
  }

  // Undefined Parsing - VJ (just for IIDX)
  if (infoCopy.vj === undefined && constants.IIDXArcadeVersions.indexOf(version) > -1) {
    // IF the info has a movie property, use that
    if (infoCopy.movie !== undefined) {
      infoCopy.vj = infoCopy.movie;
    }

    // IF no undefined parsing was done, say so
    if (infoCopy.vj === undefined) {
      console.log(`ERROR IN PARSING: Song property 'vj' was not found in special cases! (${infoCopy.remywiki})`);
    }
  }

  if (debug && allowArrayParsing) {
    // Array Parsing - BPM
    if (Array.isArray(infoCopy.bpm)) {
      const result = cleanArrayToString(infoCopy.remywiki, 'bpm', version, infoCopy.bpm, debug);
      if (result !== undefined) infoCopy.bpm = result;
    }

    // Array Parsing - Length
    if (Array.isArray(infoCopy.length)) {
      const result = cleanArrayToString(infoCopy.remywiki, 'length', version, infoCopy.length, debug);
      if (result !== undefined) infoCopy.length = result;
    }

    // Array Parsing - VJ
    if (Array.isArray(infoCopy.vj)) {
      const result = cleanArrayToString(infoCopy.remywiki, 'vj', version, infoCopy.vj, debug);
      if (result !== undefined) infoCopy.vj = result;
    }
  }

  // Returning the info copy
  return infoCopy;
}

// parseSongInfo()
function parseSongInfo(songObj, pElement, version, debug = false) {
  // Defining the song info object
  let songInfo = { ...songObj };

  // Parsing the song info from the paragraph
  const infoStrings = pElement.text().split('\n');
  infoStrings.forEach((str) => {
    const stringArray = str.split(/:\s+/g);
    if (stringArray.length > 1) {
      const propArray = stringArray[0].split('/');
      const valArray = stringArray[1].split(noCommaInParenthesesRegex);
      propArray.forEach((prop) => {
        const propName = prop.replace(/\W/g, '').toLowerCase();
        switch (propName) {
          case 'artist':
            songInfo[propName] = valArray[0];
            break;
          default:
            songInfo[propName] = valArray;
            break;
        }
        if (valArray.length === 1) {
          songInfo[propName] = valArray[0];
        } else {
          songInfo[propName] = valArray;
        }
      });
    }
  });

  // Cleaning up the song info
  songInfo = cleanUpSongInfo(songInfo, version, debug);

  // Debug Print
  if (debug) {
    console.log('~~~~~~~~~~ SONG INFO ~~~~~~~~~~');
    console.dir(songInfo);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  }

  // Returning the song info object
  return songInfo;
}

// Setting up the exports
module.exports = {
  PrintChartTable: printTableArray,
  TableToArray: tableToArray,
  StyleTextIsRelevant: styleTextIsRelevant,
  GetTableRowPastIndex: getTableRowPastIndex,
  ParseChartTableRow: parseChartTableRow,
  GetCharts: getCharts,
  CleanArrayToString: cleanArrayToString,
  CleanUpSongInfo: cleanUpSongInfo,
  ParseSongInfo: parseSongInfo,
  Songs: songs,
  NoCommaInParenthesesRegex: noCommaInParenthesesRegex,
};
