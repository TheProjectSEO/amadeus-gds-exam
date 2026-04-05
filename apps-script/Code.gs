// ─── Amadeus GDS Exam — Google Apps Script Backend ──────────────────
// Deploy as Web App: Execute as "Me", Access "Anyone"
//
// SETUP:
// 1. Create a Google Sheet with ID below
// 2. Add columns to Sheet1: Student Name | Email | Section | Questions Attempted | Total Correct | Score % | Submission Time | Answers JSON
// 3. Add a "Config" tab: A1=resultsReleased, B1=FALSE, A2=teacherEmails, B2=your@email.com
// 4. Create a Google Drive folder with ID below
// 5. Deploy this script as a Web App

var SHEET_ID = '1JfBHvEUNGhP2lcoB-HtokCXdNnwMMqcyuEiFH97qmAQ';
var DRIVE_FOLDER_ID = '111heE5yz351vNOS0kWybTs7pRJGcs3hi';

// ─── Answer Key (server-side authoritative copy) ────────────────────
// This must match the questions in questions.ts + questions-extra.ts
var ANSWER_KEY = {
  1: 'DAN MANILA', 2: 'DAN BANGKOK', 3: 'DAN SINGAPORE', 4: 'DAN TOKYO',
  5: 'DAN LOS ANGELES', 6: 'DAN MO*/UY', 7: 'DAN PA*/FR', 8: 'DAN TO*/JP',
  9: 'DAN LO*/GB', 10: 'DAN SE*/KR', 11: 'DAC PAR/N', 12: 'DAC LON/N',
  13: 'DC PH', 14: 'DC JAPAN', 15: 'DNS USNY', 16: 'DNS USCA',
  17: 'DNA PR', 18: 'DNA EMIRATES', 19: 'DNE 777', 20: 'DNE A320',
  21: 'DD ATH/FRA', 22: 'DD MNL/LON', 23: 'DD TYO/NYC', 24: 'DD FRA',
  25: 'DD BKK', 26: 'DD BKK1300/LON', 27: 'DD TYO0900/MNL', 28: 'DD MNL2000/NYC',
  29: 'DD SIN/DXB', 30: 'DD LAX0800/SEL',
  31: 'AN05APRMNLBKK', 32: 'AN10MAYMNLSIN', 33: 'AN15JUNTYOMNL',
  34: 'AN20JULSELBKK', 35: 'AN01AUGLONNYC',
  36: 'AN05MAYMNLBKK*07MAYBKKMNL', 37: 'AN10JUNMNLSIN*15JUNSINMNL',
  38: 'AN01JULTYOMNL*10JULMNLTYO', 39: 'AN20AUGSELBKK*25AUGBKKSEL',
  40: 'AN05SEPLONPAR*12SEPPARLON',
  41: 'AN05APRMNLBKK/APR', 42: 'AN12MAYMNLSIN/ASQ', 43: 'AN20JUNMNLNRT/AJL',
  44: 'AN15JULMNLHKG/A5J', 45: 'AN10AUGBKKLON/AEK',
  46: 'AN05MAYMNLBKK*07MAYBKKMNL/APR', 47: 'AN01JUNMNLSIN*10JUNSINMNL/ASQ',
  48: 'AN05APRMNLLON/XBKK', 49: 'AN12MAYMNLPAR/XSIN', 50: 'AN20JUNMNLNYC/XNRT',
  51: 'AN15JULSELLON/XDXB', 52: 'AN10AUGMNLFRA/XHKG',
  53: 'AN05APRMNLBKK/KR', 54: 'AN12MAYMNLSIN/KJ', 55: 'AN20JUNMNLNRT/KW',
  56: 'AN15JULBKKLON/KR', 57: 'AN10AUGSELPAR/KJ', 58: 'AN25SEPMNLDXB/KW',
  59: 'AN05APRMNLBKK/FN', 60: 'AN12MAYMNLSIN/FN', 61: 'AN20JUNMNLNRT/FN',
  62: 'AN15JULBKKHKG/FN', 63: 'AN10AUGSELTYO/FN',
  64: 'AN05APRMNLBKK/APR/KJ', 65: 'AN12MAYMNLSIN/ASQ/FN',
  66: 'AN20JUNMNLLON/XBKK/KR', 67: 'AN15JULMNLNRT/AJL/KW',
  68: 'AN01AUGMNLBKK*10AUGBKKMNL/A5J/FN', 69: 'AN05SEPMNLDXB/AEK/KJ/XBKK',
  70: 'AN10OCTMNLPAR/FN/KR',
  71: 'AN25NOVMNLHKG', 72: 'AN01DECMNLBKK*15DECBKKMNL',
  73: 'AN20JANMNLLON/KR', 74: 'AN14FEBMNLSIN/FN',
  75: 'AN10MARMNLTYO/APR/KJ', 76: 'AN05APRMNLBKK/A5J/KW',
  77: 'AN01MAYMNLSIN*10MAYSINMNL/ASQ/KJ', 78: 'AN15JUNMNLLON/AEK/XDXB',
  79: 'AN20JULBKKTYO/FN/KR', 80: 'AN01AUGMNLPAR*15AUGPARMNL/XHKG/KW',
  81: 'NM1DELACRUZ/JUANMR', 82: 'NM2SANTOS/MARIAMRS/ANAMISS',
  83: 'NM1REYES/CARLOSMR;NM1GARCIA/ANNAMRS',
  84: 'NM2TORRES/MARKMR/LILYMISS(CHD/15MAR15)',
  85: 'NM1CRUZ/MARIAMRS(INF/BABYMSTR/10JAN24)',
  86: 'SS2Y1', 87: 'SS1J2', 88: 'SS3W1', 89: 'SS1R1', 90: 'SS2Y3',
  91: 'SS4W2', 92: 'SS1J1', 93: 'SS2R2', 94: 'SS1Y4',
  95: 'AP09171234567-M', 96: 'APE-JUAN.DELACRUZ@GMAIL.COM',
  97: 'TKOK', 98: 'TKTL25APR',
  99: 'RFJUAN', 100: 'RFMARIA',
  // Extra questions (101-200)
  101: 'DAN DUBAI', 102: 'DAN HONG KONG', 103: 'DAN NEW YORK', 104: 'DAN SYDNEY',
  105: 'DAN FRANKFURT', 106: 'DAN BA*/TH', 107: 'DAN SI*/SG', 108: 'DAN DU*/AE',
  109: 'DAN SY*/AU', 110: 'DAN MA*/ES', 111: 'DAC NYC/N', 112: 'DAC TYO/N',
  113: 'DC TH', 114: 'DC SINGAPORE', 115: 'DNS AUNS', 116: 'DNS CAON',
  117: 'DNA SQ', 118: 'DNA CATHAY PACIFIC', 119: 'DNE 380', 120: 'DNE 737',
  121: 'DD DXB/TYO', 122: 'DD SEL/LON', 123: 'DD SYD/LAX', 124: 'DD SIN',
  125: 'DD DXB', 126: 'DD LON1400/TYO', 127: 'DD MNL1500/DXB', 128: 'DD NYC1000/SIN',
  129: 'DD HKG/PAR', 130: 'DD SEL1800/FRA',
  131: 'AN12APRHKGMNL', 132: 'AN18MAYSINBKK', 133: 'AN22JUNDXBMNL',
  134: 'AN05JULMNLCEB', 135: 'AN10AUGBKKTYO',
  136: 'AN10MAYMNLHKG*14MAYHKGMNL', 137: 'AN01JUNMNLNRT*08JUNNRTMNL',
  138: 'AN15JULSINMNL*22JULMNLSIN', 139: 'AN01SEPMNLDXB*10SEPDXBMNL',
  140: 'AN20OCTBKKSIN*25OCTSINBKK',
  141: 'AN15APRMNLHKG/ACX', 142: 'AN20MAYMNLNRT/AJL', 143: 'AN10JUNMNLSEL/AKE',
  144: 'AN25JULSINBKK/ATG', 145: 'AN15AUGMNLLAX/APR',
  146: 'AN10MAYMNLHKG*14MAYHKGMNL/ACX', 147: 'AN01JUNMNLNRT*08JUNNRTMNL/AJL',
  148: 'AN20APRMNLPAR/XDXB', 149: 'AN15MAYMNLFRA/XSIN', 150: 'AN25JUNMNLLON/XHKG',
  151: 'AN10JULBKKPAR/XDXB', 152: 'AN01AUGMNLNYC/XNRT',
  153: 'AN12APRMNLHKG/KJ', 154: 'AN18MAYMNLNRT/KR', 155: 'AN22JUNSINBKK/KW',
  156: 'AN15JULMNLDXB/KJ', 157: 'AN10AUGMNLLAX/KR', 158: 'AN25SEPBKKMNL/KW',
  159: 'AN12APRMNLHKG/FN', 160: 'AN18MAYMNLCEB/FN', 161: 'AN22JUNSINMNL/FN',
  162: 'AN15JULMNLDXB/FN', 163: 'AN10AUGBKKMNL/FN',
  164: 'AN12APRMNLHKG/ACX/KJ', 165: 'AN18MAYMNLNRT/AJL/FN',
  166: 'AN22JUNMNLPAR/XDXB/KR', 167: 'AN15JULMNLSEL/AKE/KW',
  168: 'AN01AUGMNLCEB*05AUGCEBMNL/APR/FN', 169: 'AN10SEPMNLLON/AEK/KJ/XDXB',
  170: 'AN15OCTMNLFRA/FN/KJ',
  171: 'AN20NOVMNLCEB', 172: 'AN10DECHKGMNL*20DECMNLHKG',
  173: 'AN15JANMNLNRT/KR', 174: 'AN10FEBMNLDXB/FN',
  175: 'AN20MARMNLHKG/ACX/KJ', 176: 'AN05APRBKKMNL/ATG/KW',
  177: 'AN01MAYMNLDXB*15MAYDXBMNL/AEK/KR', 178: 'AN20JUNMNLFRA/ASQ/XSIN',
  179: 'AN25JULMNLSEL/FN/KJ', 180: 'AN01AUGMNLLAX*20AUGLAXMNL/XNRT/KW',
  181: 'NM1GARCIA/ANNAMRS', 182: 'NM2REYES/CARLOSMR/PEDROMSTR',
  183: 'NM1SANTOS/MARIAMRS;NM1DELACRUZ/JUANMR',
  184: 'NM2GARCIA/ANNAMRS/JOSEMSTR(CHD/20JUN14)',
  185: 'NM1REYES/CARLOSMR(INF/MILAMISS/05FEB25)',
  186: 'SS1J2', 187: 'SS2W2', 188: 'SS1R3', 189: 'SS2J1', 190: 'SS3Y1',
  191: 'SS2J2', 192: 'SS1R2', 193: 'SS2W3', 194: 'SS1Y2',
  195: 'AP09187654321-M', 196: 'APE-MARIA.SANTOS@YAHOO.COM',
  197: 'TKOK', 198: 'TKTL15MAY',
  199: 'RFCARLOS', 200: 'RFANNA'
};

// ─── Setup (run once) ───────────────────────────────────────────────
// Call this once to initialize the Sheet structure and Config tab.
// Can be triggered via: ?action=setup&teacherEmail=your@gmail.com

function setupSheet(teacherEmail) {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Setup Sheet1 headers
  var sheet1 = ss.getSheetByName('Sheet1');
  if (!sheet1) {
    sheet1 = ss.insertSheet('Sheet1');
  }
  var headers = ['Student Name', 'Email', 'Section', 'Questions Attempted', 'Total Correct', 'Score %', 'Submission Time', 'Answers JSON'];
  sheet1.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet1.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet1.setFrozenRows(1);

  // Auto-resize columns
  for (var i = 1; i <= headers.length; i++) {
    sheet1.autoResizeColumn(i);
  }

  // Setup Config tab
  var config = ss.getSheetByName('Config');
  if (!config) {
    config = ss.insertSheet('Config');
  }
  config.getRange('A1').setValue('resultsReleased');
  config.getRange('B1').setValue('FALSE');
  config.getRange('A2').setValue('teacherEmails');
  config.getRange('B2').setValue(teacherEmail || 'teacher@gmail.com');
  config.getRange('A1:A2').setFontWeight('bold');

  return { success: true, message: 'Sheet initialized with headers and Config tab' };
}

// ─── Entry Points ───────────────────────────────────────────────────

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'setup') {
      return jsonResponse(setupSheet(data.teacherEmail));
    } else if (action === 'submitExam') {
      return jsonResponse(handleSubmitExam(data));
    } else if (action === 'releaseResults') {
      return jsonResponse(handleReleaseResults(data));
    }

    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === 'setup') {
      return jsonResponse(setupSheet(e.parameter.teacherEmail));
    } else if (action === 'checkResults') {
      return jsonResponse(handleCheckResults(e.parameter));
    } else if (action === 'getSubmissions') {
      return jsonResponse(handleGetSubmissions(e.parameter));
    }

    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ─── Handlers ───────────────────────────────────────────────────────

function handleSubmitExam(data) {
  // Verify token
  var user = verifyToken(data.idToken);
  if (!user) return { success: false, error: 'Invalid token' };

  // Check for duplicate submission
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  var emails = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (emails[i][0] === user.email) {
      return { success: false, error: 'Already submitted', alreadySubmitted: true };
    }
  }

  // Grade server-side
  var answers = data.answers || {};
  var questionOrder = data.questionOrder || [];
  var totalCorrect = 0;
  var questionsAttempted = 0;

  for (var q = 0; q < questionOrder.length; q++) {
    var qId = questionOrder[q];
    var studentAnswer = answers[qId] || '';
    if (studentAnswer.trim()) {
      questionsAttempted++;
      if (studentAnswer.trim() === ANSWER_KEY[qId]) {
        totalCorrect++;
      }
    }
  }

  var scorePercent = questionOrder.length > 0 ? (totalCorrect / questionOrder.length) * 100 : 0;
  var timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

  // Write to sheet
  sheet.appendRow([
    data.studentName || user.name,
    user.email,
    data.studentSection || '',
    questionsAttempted,
    totalCorrect,
    Math.round(scorePercent * 10) / 10,
    timestamp,
    JSON.stringify(answers)
  ]);

  // Create Drive document
  createAnswerDoc({
    studentName: data.studentName || user.name,
    email: user.email,
    section: data.studentSection || '',
    timestamp: timestamp,
    answers: answers,
    questionOrder: questionOrder,
    totalCorrect: totalCorrect,
    questionsAttempted: questionsAttempted,
    scorePercent: scorePercent
  });

  var released = isResultsReleased();

  return {
    success: true,
    resultsReleased: released,
    totalCorrect: released ? totalCorrect : undefined,
    totalQuestions: released ? questionOrder.length : undefined
  };
}

function handleCheckResults(params) {
  var user = verifyToken(params.idToken);
  if (!user) return { error: 'Invalid token' };

  var released = isResultsReleased();

  if (!released) {
    return { released: false };
  }

  // Find student's row
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === user.email) {
      return {
        released: true,
        totalCorrect: data[i][4],
        totalQuestions: 100,
        scorePercent: data[i][5]
      };
    }
  }

  return { released: true, error: 'No submission found' };
}

function handleReleaseResults(data) {
  var user = verifyToken(data.idToken);
  if (!user) return { success: false, error: 'Invalid token' };

  if (!isTeacher(user.email)) {
    return { success: false, error: 'Unauthorized' };
  }

  var config = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Config');
  config.getRange('B1').setValue(data.release ? 'TRUE' : 'FALSE');

  return { success: true, released: data.release };
}

function handleGetSubmissions(params) {
  var user = verifyToken(params.idToken);
  if (!user) return { error: 'Invalid token' };

  if (!isTeacher(user.email)) {
    return { error: 'Unauthorized' };
  }

  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  var data = sheet.getDataRange().getValues();
  var submissions = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) { // has student name
      submissions.push({
        studentName: data[i][0],
        email: data[i][1],
        section: data[i][2],
        questionsAttempted: data[i][3],
        totalCorrect: data[i][4],
        scorePercent: data[i][5],
        submissionTime: data[i][6]
      });
    }
  }

  return { submissions: submissions };
}

// ─── Helpers ────────────────────────────────────────────────────────

function verifyToken(idToken) {
  if (!idToken) return null;
  try {
    var response = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken,
      { muteHttpExceptions: true }
    );
    if (response.getResponseCode() !== 200) return null;
    var payload = JSON.parse(response.getContentText());
    return { email: payload.email, name: payload.name, sub: payload.sub };
  } catch (err) {
    return null;
  }
}

function isResultsReleased() {
  var config = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Config');
  var value = config.getRange('B1').getValue();
  return value === 'TRUE' || value === true;
}

function isTeacher(email) {
  var config = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Config');
  var teacherEmails = config.getRange('B2').getValue().toString();
  var list = teacherEmails.split(',').map(function(e) { return e.trim().toLowerCase(); });
  return list.indexOf(email.toLowerCase()) >= 0;
}

function createAnswerDoc(data) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var docName = 'Exam - ' + data.studentName + ' - ' + data.email + ' - ' + data.timestamp.split(',')[0];
    var doc = DocumentApp.create(docName);
    var body = doc.getBody();

    // Header
    body.appendParagraph('AMADEUS GDS PRACTICAL EXAMINATION')
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('');
    body.appendParagraph('Student: ' + data.studentName);
    body.appendParagraph('Email: ' + data.email);
    body.appendParagraph('Section: ' + data.section);
    body.appendParagraph('Submitted: ' + data.timestamp);
    body.appendParagraph('Score: ' + data.totalCorrect + '/' + data.questionOrder.length +
                         ' (' + Math.round(data.scorePercent * 10) / 10 + '%)');
    body.appendParagraph('Questions Attempted: ' + data.questionsAttempted + '/' + data.questionOrder.length);
    body.appendHorizontalRule();
    body.appendParagraph('');

    // Each question
    for (var i = 0; i < data.questionOrder.length; i++) {
      var qId = data.questionOrder[i];
      var studentAnswer = data.answers[qId] || '(not answered)';
      var correctAnswer = ANSWER_KEY[qId] || '(unknown)';
      var isCorrect = studentAnswer.trim() === correctAnswer;

      body.appendParagraph('Q' + (i + 1) + ' [#' + qId + ']');
      body.appendParagraph('  Student Answer: ' + studentAnswer);
      body.appendParagraph('  Correct Answer: ' + correctAnswer);
      body.appendParagraph('  Result: ' + (isCorrect ? 'CORRECT' : 'INCORRECT'));
      body.appendParagraph('');
    }

    doc.saveAndClose();

    // Move to folder
    var file = DriveApp.getFileById(doc.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  } catch (err) {
    Logger.log('Error creating doc: ' + err.message);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
