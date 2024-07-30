const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');
const namesRouter = express.Router();

async function checkYouTubeHandle(handle) {
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YT_KEY
    });

    try {
        const response = await youtube.search.list({
            part: 'snippet',
            q: handle,
            type: 'channel',
            maxResults: 1
        });

        // Log the response for debugging
        console.log('\nYouTube API Response:\n', JSON.stringify(response.data, null, 2));

        // Check if the response contains items
        if (response.data && response.data.items && response.data.items.length > 0) {
            // If items are found, the handle exists
            return true;
        } else {
            console.log(`\nNo channel found for the handle: ${handle}\n`);
            return false;
        }
    } catch (error) {
        console.error(`\nError checking YouTube handle: ${handle}\n`, error);
        return false;
    }
}

async function checkFacebookPageExists(pageId) {
    const url = `https://www.facebook.com/${pageId}`;

    try {
        const response = await axios.get(url);
        // If the request is successful, analyze the content to determine if the page exists
        if (response.status === 200) {
            const pageContent = response.data;

            // Write the response data to an HTML file for debugging
            const filePath = path.join(__dirname, `${pageId}.html`);
            fs.writeFileSync(filePath, pageContent);
            console.log(`\nPage content written to ${filePath}\n`);

            const pageNotFoundIndicators = [
                "Sorry, this content isn't available right now",
                "The link you followed may be broken, or the page may have been removed."
            ];

            // Check for indicators in the response content
            for (const indicator of pageNotFoundIndicators) {
                if (pageContent.includes(indicator)) {
                    console.log(`\nPage not found for the handle: ${pageId}\n`);
                    return false;
                }
            }

            return true;
        }
    } catch (error) {
        console.error(`\nError checking Facebook page: ${pageId}\n`, error);
        return false;
    }

    return false;
}

async function checkInstagram(username) {
    // Implement Instagram check
    return false; // Placeholder return
}

async function checkLinkedIn(username) {
    // Implement LinkedIn check
    return false; // Placeholder return
}

async function checkTwitter(username) {
    // Implement Twitter check
    return false; // Placeholder return
}

namesRouter.get('/check-username', async (req, res) => {
    const { platform, usernames } = req.query;
    const usernameList = usernames.split(',');

    try {
        let results = [];
        switch (platform) {
            case 'youtube':
                results = await Promise.all(usernameList.map(async (username) => {
                    const exists = await checkYouTubeHandle(username.trim());
                    return { username, exists };
                }));
                break;
            case 'instagram':
                results = await Promise.all(usernameList.map(async (username) => {
                    const exists = await checkInstagram(username.trim());
                    return { username, exists };
                }));
                break;
            case 'linkedin':
                results = await Promise.all(usernameList.map(async (username) => {
                    const exists = await checkLinkedIn(username.trim());
                    return { username, exists };
                }));
                break;
            case 'twitter':
                results = await Promise.all(usernameList.map(async (username) => {
                    const exists = await checkTwitter(username.trim());
                    return { username, exists };
                }));
                break;
            case 'facebook':
                results = await Promise.all(usernameList.map(async (username) => {
                    const exists = await checkFacebookPageExists(username.trim());
                    return { username, exists };
                }));
                break;
            default:
                return res.status(400).json({ error: 'Invalid platform' });
        }

        res.json({ platform, results });
    } catch (error) {
        console.error('Error checking usernames:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = { namesRouter };
