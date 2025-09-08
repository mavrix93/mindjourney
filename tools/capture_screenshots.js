/*
  Capture UI screenshots from the built frontend using Puppeteer with mocked API responses.
*/

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'screenshots');
const ORIGIN = process.env.UI_ORIGIN || 'http://localhost:3001';

// Sample data to satisfy the frontend API calls
const sampleEntries = [
  {
    id: 1,
    title: 'My wife doesn\'t like Vayana 2',
    content:
      'We watched Moana 2 today. My wife didn\'t enjoy it as much as the first. I felt neutral about it overall.',
    is_public: false,
    created_at: new Date('2025-09-07T18:30:00Z').toISOString(),
    overall_sentiment: -0.1,
    user: 'You',
    insights: [
      {
        id: 101,
        text_snippet: 'Moana 2',
        category: { name: 'Moana 2', category_type: 'movie' },
        sentiment_score: -0.2,
        confidence_score: 0.92,
      },
      {
        id: 102,
        text_snippet: 'wife\'s opinion',
        category: { name: "wife's opinion", category_type: 'person' },
        sentiment_score: -0.3,
        confidence_score: 0.88,
      },
      {
        id: 103,
        text_snippet: 'movie review',
        category: { name: 'movie review', category_type: 'activity' },
        sentiment_score: 0.0,
        confidence_score: 0.77,
      },
    ],
    documents: [],
  },
  {
    id: 2,
    title: 'Prague is a beautiful city',
    content:
      'Prague is beautiful city. Much better than Bratislava. Loved the bridges and cafes.',
    is_public: true,
    created_at: new Date('2025-09-06T11:00:00Z').toISOString(),
    overall_sentiment: 0.7,
    user: 'You',
    insights: [
      {
        id: 201,
        text_snippet: 'Prague',
        category: { name: 'Prague', category_type: 'place' },
        sentiment_score: 0.8,
        confidence_score: 0.95,
      },
      {
        id: 202,
        text_snippet: 'Bratislava',
        category: { name: 'Bratislava', category_type: 'place' },
        sentiment_score: 0.3,
        confidence_score: 0.82,
      },
      {
        id: 203,
        text_snippet: 'European Capitals',
        category: { name: 'European Capitals', category_type: 'other' },
        sentiment_score: 0.6,
        confidence_score: 0.76,
      },
    ],
    documents: [],
  },
  {
    id: 3,
    title: 'Morning Run by the River',
    content:
      'Did a 5k run along the river. The sunrise was amazing and I felt energized for the day.',
    is_public: false,
    created_at: new Date('2025-09-05T06:45:00Z').toISOString(),
    overall_sentiment: 0.9,
    user: 'You',
    insights: [
      {
        id: 301,
        text_snippet: '5k run',
        category: { name: 'Running', category_type: 'activity' },
        sentiment_score: 0.9,
        confidence_score: 0.9,
      },
      {
        id: 302,
        text_snippet: 'river',
        category: { name: 'River', category_type: 'place' },
        sentiment_score: 0.7,
        confidence_score: 0.8,
      },
      {
        id: 303,
        text_snippet: 'sunrise',
        category: { name: 'Sunrise', category_type: 'other' },
        sentiment_score: 0.95,
        confidence_score: 0.85,
      },
    ],
    documents: [],
  },
];

function json(data) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(data),
  };
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Helper to wait for text to appear on the page body. More reliable than Puppeteer's text/ selectors.
    async function waitForText(targetText, timeoutMs = 10000) {
      await page.waitForFunction(
        (text) => document && document.body && document.body.innerText && document.body.innerText.includes(text),
        { timeout: timeoutMs },
        targetText,
      );
    }

    await page.setRequestInterception(true);
    page.on('request', async (req) => {
      const url = req.url();
      const method = req.method();
      if (method !== 'GET') return req.continue();

      // Intercept Entries endpoints
      if (/\/api\/entries\/$/.test(url)) {
        return req.respond(json(sampleEntries));
      }
      if (/\/api\/entries\/public\//.test(url)) {
        const publicEntries = sampleEntries.filter((e) => e.is_public);
        return req.respond(json(publicEntries));
      }
      const entryIdMatch = url.match(/\/api\/entries\/(\d+)\//);
      if (entryIdMatch) {
        const id = Number(entryIdMatch[1]);
        const found = sampleEntries.find((e) => e.id === id) || sampleEntries[0];
        return req.respond(json(found));
      }
      if (/\/api\//.test(url)) {
        // Default mock for any other API calls
        return req.respond(json({ results: [] }));
      }
      return req.continue();
    });

    // HOME
    await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle0' });
    await waitForText('MindJourney');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home.png'), fullPage: true });

    // ENTRY DETAIL
    await page.goto(`${ORIGIN}/entry/1`, { waitUntil: 'networkidle0' });
    await waitForText('AI Insights').catch(() => {});
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'entry_detail.png'), fullPage: true });

    // TIMELINE
    await page.goto(`${ORIGIN}/timeline`, { waitUntil: 'networkidle0' });
    await waitForText('Timeline').catch(() => {});
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'timeline.png'), fullPage: true });

    console.log('Screenshots saved to:', SCREENSHOTS_DIR);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

