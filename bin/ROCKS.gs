"/*  Author: FrDarryl Jordan OLW, BSc, MDiv
    Name: Restful, Objective Catholic Knowledge System (ROCKS) Shared Functions
*/

const RsvReadingsFetchBaseUrl = 'https://www.ewtn.com/catholicism/daily-readings/';

function onOpen(e) {
    Logger.log('Entering onOpen');

    var spreadsheet = SpreadsheetApp.getActive();
    var spreadsheetName = spreadsheet.getName();
    var sheets = spreadsheet.getSheets();
    var sheetName = sheets[0].getName();

    var menuItems = [];
    menuItems.push({name: 'Add row(s) using copy of selection', functionName: 'addRowsToActiveSheet'});
    menuItems.push({name: 'Get RSV Mass Readings by date', functionName: 'getRsvMassLessonsByDate'});
    menuItems.push({name: 'Sort active sheet', functionName: 'sortSheet'});
    
    spreadsheet.addMenu('ROCKS', menuItems);
    Logger.log('Exiting onOpen');
}

function onEdit(e) {
    Logger.log('Entering onEdit');
    //updateSheet(e);
    //SpreadsheetApp.getActive().toast(Utilities.formatString('Editing value %s', e.oldValue), 'onEdit trigger', 5);
    //SpreadsheetApp.getActive().toast('You edited', 'onEdit trigger', 5);
    Logger.log('Exiting onEdit');
}
function addRowsToActiveSheet() {
/*  Purpose:
    Parameters:
    Returns:
*/
    Logger.log('Entering addRowsToActiveSheet');

    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getActiveSheet();

    var insertAfterRowIndex, numRowsToInsert;
    if (sheet.getActiveRange()) {
        insertAfterRowIndex = sheet.getActiveRange().getLastRow();
        numRowsToInsert = sheet.getActiveRange().getNumRows();
    } else {
        insertAfterRowIndex = sheet.getLastRow();
        numRowsToInsert = 1;
    }
    sheet.insertRowsAfter(insertAfterRowIndex, numRowsToInsert);

    var firstNewRowIndex = insertAfterRowIndex + 1;
    var lastNewRowIndex = insertAfterRowIndex + numRowsToInsert;
    var sheetLastColumn = sheet.getLastColumn();
    var copyFromRowRange = sheet.getRange(insertAfterRowIndex,1,1,sheetLastColumn);
    for (var copyToRowIndex=firstNewRowIndex; copyToRowIndex<=lastNewRowIndex; copyToRowIndex++) {
        var copyToRowRange = sheet.getRange(copyToRowIndex,1,1,sheetLastColumn);
        copyRowFormatAndFormulas(copyFromRowRange, copyToRowRange);
    }
    if (sheet.getActiveRange()) {
        sheet.getRange(firstNewRowIndex,
                       sheet.getActiveRange().getColumnIndex(),
                       sheet.getActiveRange().getNumRows(),
                       sheet.getActiveRange().getNumColumns())
            .setValues(sheet.getActiveRange().getValues());
    }
    var toastMsg = Utilities.formatString('Added %d new rows after row %d', numRowsToInsert, insertAfterRowIndex);
    spreadsheet.toast(toastMsg, 'ADD ROW', 10);
    Logger.log(toastMsg);
    //spreadsheet.flush();
    Logger.log('Exiting addRowsToActiveSheet');
}

function copyRowFormatAndFormulas(fromRowRange, toRowRange) {
/*  Purpose:
    Parameters:
    Returns:
*/
    Logger.log('Entering copyFormatAndFormulas');
    fromRowRange.copyTo(toRowRange, {formatOnly: true});

    var formulas = fromRowRange.getFormulasR1C1();
    for(var x in formulas) {
        for(var y in formulas[x]) {
            if(formulas[x][y] == """") continue;
            toRowRange.getCell(parseInt(x) + 1, parseInt(y) + 1).setFormulaR1C1(formulas[x][y]);
        }
    }

    Logger.log('Exiting copyFormatAndFormulas');
}

function sortSheet(spreadsheetId, sheetName) {
/*  Purpose:
    Parameters:
    Returns:
*/
    Logger.log('Entering sortSheet');

    var spreadsheet,sheet;
    
    if (spreadsheetId) {
        spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        if (sheetName) {
            sheet = spreadsheet.getSheetByName(sheetName);
        } else {
            sheet = spreadsheet.getActiveSheet();
            sheetName = sheet.getName();
        }
    } else {
        spreadsheet = SpreadsheetApp.getActive();
        sheet = spreadsheet.getActiveSheet();
        sheetName = sheet.getName();
    }

    var toastMsg = Utilities.formatString('Sorting sheet %s', sheetName);
    const fieldNameValues = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const fieldMetadataValues = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
    const sortTokens = fieldMetadataValues //arrow functions not supported as of 2019-07-05
      .map(function(fieldMetadataValue,index) { return fieldMetadataValue.split(';')[2] + ';' + (index + 1) + ';' + fieldNameValues[index]})
      .filter(function(sortToken) { return sortToken.match(/^[1-9]/)})
      .sort();
    for (var sortToken of sortTokens) {
        var sortAscending = sortToken.match(/A/) ? true : false; 
        var colNum = sortToken.split(';')[1];
        //Logger.log('sortSheet: for sortToken is ' + sortToken + ' so sorting column ' + sortToken.split(';')[2] + ' which is colNum ' + colNum + ' with boolean ' + sortAscending);
        sheet.sort(colNum, sortAscending);
        var separator = toastMsg.match(/ by /) ?  ' then ' : ' by ';
        var direction = sortAscending ? 'Ascending' : 'Descending';
        toastMsg += separator + sortToken.split(';')[2] + ' (colNum ' + colNum + ') in ' + direction + ' order';
    }
    toastMsg += toastMsg.match(/ by /) ?  '.' : '. Warning: Not sorted as no sortToken/s specified. Append to last frozen row for columns to be sorted starting with semicolon, e.g., ""string;1A""';
    eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js').getContentText());
    //var date = moment().format(""MMM Do YY"");
    //toastMsg += date;
    spreadsheet.toast(toastMsg, 'SORT SHEET', 10);
    Logger.log(toastMsg);

    Logger.log('Exiting sortSheet');
}
function appendMassPropersRsv()
{
  var ui = SpreadsheetApp.getUi()
  var result = ui.prompt(
    'Mass Propers Date Prompt',
    'Please enter a date (UTC: yyyy-mm-dd):',
    ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var utcDate = result.getResponseText();
  if (button !== ui.Button.OK) {
    return;
  }

  showMassPropers('https://www.ewtn.com/catholicism/daily-readings/' + utcDate);
}

function showMassPropers(dateUrl)
{
  var newRows = [];
  newRows.push(getMassPropers(dateUrl));
  SpreadsheetApp.getActive().getSheetByName('MassPropersRSV').appendRow(newRows);
}

function getRsvMassLessonsByDate(utcDate)
{
  var ui = SpreadsheetApp.getUi();
  if (! utcDate) {
    var result = ui.prompt(
      'Mass Propers Date Prompt',
      'Please enter a date (UTC: yyyy-mm-dd):',
      ui.ButtonSet.OK_CANCEL);

    // Process the user's response.
    var button = result.getSelectedButton();
    if (button !== ui.Button.OK) {
      ui.alert('No readings fetched.');  
      return;
    }
    utcDate = result.getResponseText();
  }
  var dailyMassLessonsUrl = RsvReadingsFetchBaseUrl + utcDate; 
  var response = UrlFetchApp.fetch(dailyMassLessonsUrl);
  if (response.getResponseCode() !== 200) {
    ui.alert('Fetch of url ' + dailyMassLessonsUrl + ' returned ' + response.getResponseCode() + '; no readings fetched.');  
    return;
  }
  const $ = Cheerio.load(response.getContentText());
  var titleClassElements = [];
  let replaceRegex = /\s +(.)/g;
  let replaceWith = ' $1';
  $('.readings__title').each(function( index ) {
    titleClassElements.push($(this).text().replace(replaceRegex,replaceWith));
  });
  var referenceClassElements = [];
  $('.readings__reference').each(function( index ) {
    referenceClassElements.push($(this).text().replace(replaceRegex,replaceWith));
  });
  var passageClassElements = [];
  $('.readings__passage').each(function( index ) {
    passageClassElements.push($(this).text().replace(replaceRegex,replaceWith));
  });
  // First element with title class is the day name
  var sheet = SpreadsheetApp.getActive().getSheetByName('MassPropersRSV');
  sheet.appendRow([ titleClassElements.shift() + ': ' + titleClassElements.shift()] );
  while (titleClassElements.length > 0) {
    sheet.appendRow([ titleClassElements.shift() + ': ' + referenceClassElements.shift() ]);
    sheet.appendRow([ passageClassElements.shift() ]);
  }
}

function getRsvMassLessonsForSundayNext() {
  
  getRsvMassLessonsByDate('2021-11-21');

}

function getSelectedRsvUrlText(bookUrl) {
  var ui = SpreadsheetApp.getUi();
  if (! bookUrl) {
    if (! SpreadsheetApp.getActive().getSheetByName('RevisedStandardVersionBookUrls').getCurrentCell()) {
      ui.alert('No url selected in RevisedStandardVersionBookUrls')
      return;
    }

    bookUrl = SpreadsheetApp.getActive().getSheetByName('RevisedStandardVersionBookUrls').getCurrentCell().getValue();
  }
  //ui.alert('Fetching URL: ' + bookUrl);
  var response = UrlFetchApp.fetch(bookUrl);
  if (response.getResponseCode() !== 200) {
    ui.alert('Fetch of url ' + bookUrl + ' returned ' + response.getResponseCode() + '; nothing fetched.');  
    return;
  }
  let regex0 = /(\r\n|\n|\r)/gm;
  let replace0 = '';
  let regex1 = /<hr><h.>([A-Za-z0-9. ]+)<\/h.>/gmi;
  let replace1 = '|$1 ';
  let regex2 = /\[<b>([0-9]+)<\/b>\]/gi;
  let replace2 = '|$1 ';
  let regex3 = /<\/?p>/gi;
  let replace3 = '';
  let regex4 = /.+<\/h2>/gmi;
  let replace4 = '';
  let rowifiedHtml = response.getContentText().
                     replace(regex0,replace0).
                     replace(regex1,replace1).
                     replace(regex2,replace2).
                     replace(regex3,replace3).
                     replace(regex4,replace4)
  ui.alert('New HTML: ' + rowifiedHtml);
  const $ = Cheerio.load(rowifiedHtml);
  var chapters = [];
  $('hr').each(function( index ) {
    //chapters.push($(this).text().replace(replaceRegex,replaceWith));
    chapters.push($(this).text());
  });
}"
