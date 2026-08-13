# JSONS Digital Score Analysis Software

A GitHub Pages client-facing lead-generation website for **JSONS BRANDING STUDIO**.

## Architecture

- **Frontend:** GitHub Pages (static HTML/CSS/JS)
- **Backend:** Google Apps Script Web App
- **Storage:** Your Google Sheet
- **Screenshot analysis:** Gemini vision model called from Apps Script, so the API key is NOT placed in GitHub/frontend code.
- **Uploads:** Saved to a Google Drive folder created by Apps Script.

Google Apps Script web apps support `doPost(e)` and can be deployed as a web app. Gemini's API supports image input using inline base64 image data.

## 1. Put the website on GitHub

Upload these files/folders to a GitHub repository:

```text
index.html
styles.css
script.js
assets/logo.png
```

Enable **Settings → Pages → Deploy from branch → main → /root**.

Your public site will be HTTPS on a `github.io` URL.

## 2. Configure the Google Sheet backend

Open your Google Sheet:

https://docs.google.com/spreadsheets/d/1r0vDDRLXf9rdw5ibRP-1RUX-zQfBe_AAavPHG4d0Q30/edit

Then open **Extensions → Apps Script**.

Paste the contents of `apps-script/Code.gs`.

### Add your Gemini API key

In Apps Script:

**Project Settings → Script Properties → Add script property**

Name:

```text
GEMINI_API_KEY
```

Value:

```text
YOUR_GEMINI_API_KEY
```

Do NOT put the key in `script.js` or any GitHub file.

## 3. Deploy Apps Script

In Apps Script:

**Deploy → New deployment → Web app**

Use:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the `/exec` URL.

## 4. Connect GitHub frontend to Apps Script

Open `script.js`.

Find:

```js
const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```

Replace it with your Apps Script `/exec` URL.

Commit and push.

## 5. What goes into your Sheet

Each lead creates a row containing:

- name
- contact number
- place
- email
- overall score /100
- GMB score /50
- Instagram score /50
- short client-facing GMB summary
- short GMB gist
- short Instagram summary
- short Instagram gist
- **PRIVATE — Exact Factors Needed For 100%**
- Google screenshot Drive URL
- Instagram screenshot Drive URL
- lead status
- source
- submission timestamp

The private 100% field is intentionally NOT displayed to the client.

## Important

This tool is a screenshot-based audit. It should not claim actual Google search rankings, reach, engagement, or account health unless those signals are genuinely visible in the uploaded screenshots.

For production, add spam/rate limiting before running paid traffic to the form.
