const axios = require('axios');
const cheerio = require('cheerio');
const { logger } = require('@orra/shared');

const MAX_PAGES = 20;
const visited = new Set();

async function fetchPage(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'OrraBot/1.0 (website assistant crawler)' },
    });
    return data;
  } catch (err) {
    logger.warn(`Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    try {
      const abs = new URL(href, baseUrl).href;
      if (abs.startsWith(baseUrl) && !abs.includes('#') && !abs.match(/\.(pdf|jpg|png|gif|zip)$/i)) {
        links.add(abs);
      }
    } catch {}
  });
  return [...links];
}

function extractText(html, url) {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, .cookie-banner, #cookie-banner').remove();
  const title = $('title').text().trim();
  const h1 = $('h1').first().text().trim();
  const body = $('main, article, .content, #content, body').first().text()
    .replace(/\s+/g, ' ').trim().slice(0, 5000);
  return { url, title: title || h1, content: body };
}

async function crawlWebsite(startUrl) {
  visited.clear();
  const queue = [startUrl];
  const pages = [];

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    logger.info(`Crawling: ${url}`);
    const html = await fetchPage(url);
    if (!html) continue;

    const pageData = extractText(html, url);
    if (pageData.content.length > 100) pages.push(pageData);

    const links = extractLinks(html, startUrl);
    links.forEach(link => { if (!visited.has(link)) queue.push(link); });
  }

  logger.info(`Crawled ${pages.length} pages from ${startUrl}`);
  return pages;
}

module.exports = { crawlWebsite };
