# Google Sheets contact form setup

The contact form uses a Google Apps Script web app to add each submission to a
`Contact Messages` tab in your spreadsheet. The tab and its column headers are
created automatically the first time a valid form is sent.

## Connect the form

1. Create or open the Google Sheet where you want to receive contact requests.
2. In that sheet, choose **Extensions > Apps Script**.
3. Replace the editor contents with the code from [`GoogleAppsScript.gs`](./GoogleAppsScript.gs), then save the project.
4. Choose **Deploy > New deployment**. Select **Web app**, set **Execute as** to **Me**, and set access to **Anyone**. Deploy and authorize the script when Google prompts you.
5. Copy the deployed web app URL. It should look like `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`.
6. In [`script.js`](./script.js), set `GOOGLE_SHEETS_WEB_APP_URL` to that URL.
7. Save and publish the updated site. Submit a test message and confirm that it appears in the `Contact Messages` tab.

Keep `index.html`, `styles.css`, and `script.js` together in the published
`my-website` folder, with all referenced images inside its `images` folder.

If you edit the Apps Script later, create a new deployment version (or edit the
existing deployment) so the public web app uses the updated code.

The web app must be accessible to anyone so visitors can submit the form. Do
not collect sensitive personal or financial information through this form.

## Add or change YouTube videos

In the Videos section of `index.html`, add a video card with a `data-video-url`
attribute containing the regular YouTube share link. The page supports watch,
shorts, live, embed, and `youtu.be` links:

```html
<article class="video-card" data-video-url="https://youtu.be/VIDEO_ID">
  <h3>Video title</h3>
</article>
```

Each card shows a YouTube thumbnail preview; click the preview to load the
player. On a published HTTP/HTTPS site, playback is embedded in the card. When
opening `index.html` directly as a `file://` URL, the preview opens the video on
YouTube instead, because browsers do not provide the referrer that YouTube
requires for embedded playback. The **Watch on YouTube** link remains available
if a video does not allow embedding.
