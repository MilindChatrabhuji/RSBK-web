# Google Apps Script Setup for RSBK Online

This Google Apps Script powers:
1. **Google Drive Attachment Uploads** for the Academic Discussion Forum (storing photos and PDFs in Dr. Milind's 5 TB Google Drive folder).
2. **Automated Beautiful HTML Email Notifications** (Welcome 30-Day Trial, Wallet Recharge Receipts, and 3-Day Low Balance Reminders) sent directly from Dr. Milind's official email without any third-party fees.

---

## 1. Setup Instructions (Takes 2 Minutes)

1. Open your browser and go to [https://script.google.com](https://script.google.com).
2. Make sure you are signed in as **`dr.milindchatrabhuji@gmail.com`**.
3. Click **"New project"** (top left).
4. Name the project **"RSBK Online Backend Services"**.
5. Replace all code in `Code.gs` with the complete script below.
6. Click **Deploy** &rarr; **New deployment**:
   - Select type: **Web app**
   - Description: `RSBK Online API v1.0`
   - Execute as: **Me (dr.milindchatrabhuji@gmail.com)**
   - Who has access: **Anyone**
7. Click **Deploy**, grant the standard Google Drive & Gmail permissions when prompted, and copy the Web App URL (starts with `https://script.google.com/macros/s/.../exec`).

---

## 2. Complete Apps Script Code (`Code.gs`)

```javascript
/**
 * RSBK Online — Unified Google Drive & Automated Email Backend
 * Author: Dr. Milind Chatrabhuji
 */

const FOLDER_ID = "1F-H-eGDWWiiAybYM9oXAh6Xnocuuhdj6"; // RSBK_Forum_Attachments folder

function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);

    // 1. ACTION: Send Automated Email
    if (data.action === "send_email") {
      const recipient = data.to;
      const subject = data.subject || "RSBK Online Academic Portal";
      const htmlBody = data.htmlBody || "";

      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: htmlBody,
        name: "Dr. Milind Chatrabhuji (RSBK Online)"
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Email successfully dispatched to " + recipient
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ACTION: Upload Attachment to Google Drive
    const fileName = data.fileName || "attachment_" + new Date().getTime();
    const mimeType = data.mimeType || "application/octet-stream";
    const base64Data = data.base64;

    if (!base64Data) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No file data received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Clean base64 header if present
    const cleanBase64 = base64Data.replace(/^data:.*,/, '');
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const viewUrl = file.getUrl();
    const downloadUrl = file.getDownloadUrl();
    const previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    const directImgUrl = "https://lh3.googleusercontent.com/d/" + fileId;

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: fileId,
      fileName: fileName,
      mimeType: mimeType,
      size: file.getSize(),
      viewUrl: viewUrl,
      previewUrl: previewUrl,
      directImgUrl: directImgUrl,
      downloadUrl: downloadUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    portal: "RSBK Online Backend Services",
    author: "Dr. Milind Chatrabhuji",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
```
