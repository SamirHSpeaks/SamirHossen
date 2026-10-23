function doGet() {
  return ContentService.createTextOutput("Contact form endpoint is ready.");
}

function doPost(e) {
  const submissionToken = getSubmissionToken(e);

  try {
    if (!e || !e.parameter || e.parameter.website) {
      throw new Error("Invalid form submission.");
    }

    const values = {
      name: getField(e, "name", 200),
      email: getField(e, "email", 320),
      phone: getField(e, "phone", 100),
      topic: getField(e, "topic", 300),
      message: getField(e, "message", 5000)
    };

    if (!values.name || !values.email || !values.message) {
      throw new Error("Required form fields are missing.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      throw new Error("Email address is invalid.");
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error("This Apps Script must be bound to the destination spreadsheet.");
    }

    const sheetName = "Contact Messages";
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Submitted At", "Name", "Email", "Phone", "Consultation Area", "Message"]);
    }

    sheet.appendRow([
      new Date(),
      safeSheetValue(values.name),
      safeSheetValue(values.email),
      safeSheetValue(values.phone),
      safeSheetValue(values.topic),
      safeSheetValue(values.message)
    ]);

    return createFormResponse(submissionToken, true);
  } catch (error) {
    console.error("Contact form submission failed: " + error.message);
    return createFormResponse(submissionToken, false);
  }
}

function getField(e, name, maxLength) {
  return String(e.parameter[name] || "").trim().slice(0, maxLength);
}

function getSubmissionToken(e) {
  const token = e && e.parameter ? String(e.parameter.submissionToken || "") : "";
  return /^[a-zA-Z0-9_-]{1,100}$/.test(token) ? token : "";
}

function safeSheetValue(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function createFormResponse(submissionToken, success) {
  const message = {
    type: "contact-form-result",
    submissionToken: submissionToken,
    success: success
  };
  const html = "<!doctype html><html><body><script>" +
    "window.parent.postMessage(" + JSON.stringify(message) + ", '*');" +
    "</script></body></html>";

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
