# TikTok Comment Extractor Chrome Extension

A Chrome extension that extracts comments and replies from TikTok videos and exports them as JSON files.

## Features

- 🎯 **Automatic Comment Extraction**: Extracts all comments and replies from TikTok videos
- 📊 **Comprehensive Data**: Captures comment text, likes, timestamps, user info, and reply relationships
- 🔄 **Reply Support**: Fetches nested replies for each comment
- 📱 **User-Friendly UI**: Simple button overlay on TikTok pages for easy extraction
- 💾 **JSON Export**: Downloads extracted data as structured JSON files
- 🎨 **Visual Feedback**: Real-time status updates during extraction process

## Installation

### Prerequisites

- Google Chrome browser
- TikTok account (logged in)

### Steps

1. **Download the Extension**

   ```bash
   git clone https://github.com/your-username/tiktok_comment_extractor.git
   cd tiktok_comment_extractor
   ```

2. **Enable Developer Mode in Chrome**

   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**

   - Click "Load unpacked"
   - Select the `tiktok_comment_extractor` folder
   - The extension should now appear in your extensions list

4. **Verify Installation**
   - Look for the TikTok Comment Extractor icon in your Chrome toolbar
   - Click it to open the popup and verify it's working

## Usage

### Step 1: Prepare the Video

1. Open TikTok in your browser and log in
2. Navigate to the video whose comments you want to extract
3. Scroll down to load some comments (this helps the extension capture the API endpoint)

### Step 2: Extract Comments

1. Look for the red "Export Comments" button in the bottom-right corner of the page
2. Click the button to start extraction
3. The extension will:
   - Automatically fetch all comments in batches
   - Retrieve replies for each comment
   - Display real-time progress updates
   - Download the results as a JSON file when complete

### Step 3: Access Your Data

- The JSON file will be automatically downloaded to your default Downloads folder
- Filename format: `tiktok_comments_{video_id}_{timestamp}.json`

## Data Structure

The exported JSON file contains an array of comment objects with the following structure:

```json
[
  {
    "number": 1,
    "cid": "comment_id_string",
    "parent_cid": null,
    "text": "Comment text content",
    "digg_count": 42,
    "reply_comment_total": 5,
    "type": "top_level_comment",
    "user_unique_id": "username",
    "user_nickname": "Display Name"
  },
  {
    "number": 2,
    "cid": "reply_id_string",
    "parent_cid": "parent_comment_id",
    "text": "Reply text content",
    "digg_count": 12,
    "reply_comment_total": 0,
    "type": "reply",
    "user_unique_id": "replier_username",
    "user_nickname": "Replier Display Name"
  }
]
```

### Field Descriptions

| Field                 | Description                                     |
| --------------------- | ----------------------------------------------- |
| `number`              | Sequential number for the comment               |
| `cid`                 | Unique comment ID from TikTok                   |
| `parent_cid`          | Parent comment ID (null for top-level comments) |
| `text`                | The comment text content                        |
| `digg_count`          | Number of likes on the comment                  |
| `reply_comment_total` | Number of replies to this comment               |
| `type`                | Either "top_level_comment" or "reply"           |
| `user_unique_id`      | TikTok username of the commenter                |
| `user_nickname`       | Display name of the commenter                   |

## Project Structure

```
tiktok_comment_extractor/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── injected.js           # Script injected into page context
├── scripts/
│   └── contentScript.js  # Main content script
├── popup/
│   ├── popup.html        # Extension popup interface
│   └── popup.js          # Popup functionality
├── images/
│   └── icon.png          # Extension icon
└── README.md            # This file
```

## Technical Details

### Permissions

The extension requires the following permissions:

- `storage`: For storing configuration data
- `identity`: For authentication purposes
- `webRequest`: To intercept TikTok API calls
- Host permissions for `*.tiktok.com/*` and `*.extensionsbox.com/*`

### API Limits

- Maximum comments per extraction: 10,000
- Request delay: 1 second between comment batches
- Reply request delay: 1.5 seconds between reply batches

## Troubleshooting

### Common Issues

1. **"No TikTok comment API URL captured" Error**

   - Make sure you're logged into TikTok
   - Try scrolling down on the video page to load comments
   - Refresh the page and try again

2. **Extension Button Not Appearing**

   - Check if the extension is enabled in `chrome://extensions/`
   - Make sure you're on a TikTok video page
   - Try refreshing the page

3. **Extraction Stops Prematurely**

   - This may happen due to API rate limits
   - Try again after a few minutes
   - The extension will save whatever data it collected

4. **Empty JSON File**
   - The video might not have any comments
   - Check the browser console for error messages
   - Verify you're on a valid TikTok video page

### Debug Mode

To enable debug mode:

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for messages starting with "Content Script:", "Background:", or "Injected Script:"

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-username/tiktok_comment_extractor.git
cd tiktok_comment_extractor

# No build process required - load directly in Chrome
```

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension card
4. Test your changes

### File Descriptions

- `manifest.json`: Extension configuration and permissions
- `background.js`: Handles API URL interception and messaging
- `scripts/contentScript.js`: Main extraction logic and UI
- `injected.js`: Executes fetch requests in page context
- `popup/`: Extension popup interface for status display

## Privacy & Security

- The extension only accesses TikTok comment data
- No data is sent to external servers
- All extraction happens locally in your browser
- Comments are saved only to your local device

## License

This project is licensed under GNU GPL 3.0

## Disclaimer

This extension is for educational and research purposes. Please respect TikTok's Terms of Service and use responsibly. The extension may break if TikTok changes their API structure.
