// Getting other downloader modules
const constants = require('./constants.js');

// Const Variables
const songs = [];
const noCommaInParenthesesRegex = /,\s*(?![^\[\(]*[\]\)])/g;

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

// getTableRowPastIndex()
function getTableRowPastIndex(chartTable, gameVersions, currentVersion, debug = false) {
  // Getting the pre-check variables
  const versionIndex = gameVersions.indexOf(currentVersion);

  // Defining the past index variable
  let pastIndex = -1;

  // Doing a preliminary "First Mix+" check
  for (let num = 0; num < chartTable.length; num++) {
    if (chartTable[num][0].startsWith(`${currentVersion}→`)) {
      pastIndex = num;
    }
  }

  // Looking for a PAST chart row match
  let loopIndex = versionIndex - 1;
  while (pastIndex < 0 && loopIndex > -1) {
    // Getting the current version to check against
    const oldVersion = gameVersions[loopIndex];

    // FOR each row in the chart table... (going backwards)
    for (let num = chartTable.length - 1; num > -1; num--) {
      // IF the row has the game name + the extension character... (PAST MATCH FOUND)
      const gameName = chartTable[num][0];
      if (gameName.indexOf(`${oldVersion}→`) > -1) {
        // Getting the text after the extension character...
        const hangText = gameName.substr(gameName.indexOf('→') + 1);

        // IF the hang text is to the present, then exit the loops early
        if (hangText.toLowerCase() === 'present') {
          pastIndex = num;
          loopIndex = -1;
          num = -1;
        } else {
          // ELSE... (actually searching for later game mixes)
          for (let num2 = loopIndex + 1; num2 < gameVersions.length; num2++) {
            // IF the hang text matches a newer version of the game...
            if (gameVersions[num2].indexOf(hangText) > -1) {
              // Debug Print
              if (debug) {
                console.log(`\n~~~~~~~~~~ PAST INDEX CURRENT ROW (#${num}) ~~~~~~~~~~\n`);
                console.dir(chartTable[num]);
                console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
              }

              // Setting the PAST chart row index
              pastIndex = num;

              // Exiting the loops early
              num2 = gameVersions.length;
              loopIndex = -1;
              num = -1;
            }
          }
        }
      }
    }

    // Decrementing the loop index
    loopIndex--;
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
    const chartRating = chartTable2D[rowIndex][col].replace(/[^\w/]/g, '');
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
  let seriesVersions = [];
  if (constants.DDRArcadeVersions.indexOf(version) > -1) {
    chartHeaderID = '#DanceDanceRevolution';
    seriesVersions = constants.DDRArcadeVersions;
  }
  if (constants.IIDXArcadeVersions.indexOf(version) > -1) {
    chartHeaderID = '#beatmania_IIDX';
    seriesVersions = constants.IIDXArcadeVersions;
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
    const pastIndex = getTableRowPastIndex(chartTable2D, seriesVersions, version, debug);

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

// parseSongInfo()
function parseSongInfo(pElement, debug = false) {
  // Defining the song info object
  const songInfo = {};

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
  GetTableRowPastIndex: getTableRowPastIndex,
  ParseChartTableRow: parseChartTableRow,
  GetCharts: getCharts,
  ParseSongInfo: parseSongInfo,
  Songs: songs,
  NoCommaInParenthesesRegex: noCommaInParenthesesRegex,
};
