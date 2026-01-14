const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const UserAgent = require('fake-useragent');

const app = express();
const PORT = 3000;
const BASE_URL = 'https://otakudesu.best';

app.use(cors());

// ==========================================
// HELPER FUNCTION: FETCH HTML
// ==========================================
async function fetchHtml(url) {
    try {
        const randomUA = UserAgent(); 
        const headers = {
            'User-Agent': randomUA,
            'Referer': 'https://otakudesu.best/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
        };
        console.log(`[Fetching] ${url} | UA: ${randomUA.substring(0, 20)}...`);
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// ==========================================
// 1. ENDPOINT: ON-GOING ANIME
// ==========================================
// PERBAIKAN: Gunakan Array untuk menangani rute tanpa page dan dengan page
app.get(['/api/ongoing', '/api/ongoing/:page'], async (req, res) => {
    try {
        const page = req.params.page ? Number(req.params.page) : 1;
        const targetUrl = page === 1 
            ? `${BASE_URL}/ongoing-anime/` 
            : `${BASE_URL}/ongoing-anime/page/${page}/`;

        const html = await fetchHtml(targetUrl);
        const $ = cheerio.load(html);
        const animeList = [];

        $('.venz ul li').each((index, element) => {
            const title = $(element).find('.jdlflm').text().trim();
            const episode = $(element).find('.epz').text().trim();
            const releaseDay = $(element).find('.epztipe').text().trim();
            const date = $(element).find('.newnime').text().trim();
            const image = $(element).find('.thumbz img').attr('src');
            const link = $(element).find('.thumb a').attr('href');

            if (title) {
                animeList.push({
                    title,
                    episode,
                    release_day: releaseDay,
                    date,
                    image,
                    endpoint: link ? link.replace(BASE_URL, '') : ''
                });
            }
        });

        const paginationData = getPagination($, page, 'ongoing');
        res.status(200).json({ status: 'success', pagination: paginationData, data: animeList });

    } catch (error) { handleError(res, error); }
});

// ==========================================
// 2. ENDPOINT: COMPLETE ANIME
// ==========================================
// PERBAIKAN: Gunakan Array di sini juga
app.get(['/api/complete', '/api/complete/:page'], async (req, res) => {
    try {
        const page = req.params.page ? Number(req.params.page) : 1;
        const targetUrl = page === 1 
            ? `${BASE_URL}/complete-anime/` 
            : `${BASE_URL}/complete-anime/page/${page}/`;

        const html = await fetchHtml(targetUrl);
        const $ = cheerio.load(html);
        const animeList = [];

        $('.venz ul li').each((index, element) => {
            const title = $(element).find('.jdlflm').text().trim();
            const episode = $(element).find('.epz').text().trim();
            const rating = $(element).find('.epztipe').text().trim();
            const date = $(element).find('.newnime').text().trim();
            const image = $(element).find('.thumbz img').attr('src');
            const link = $(element).find('.thumb a').attr('href');

            if (title) {
                animeList.push({
                    title,
                    episode,
                    rating,
                    uploaded_on: date,
                    image,
                    endpoint: link ? link.replace(BASE_URL, '') : ''
                });
            }
        });

        const paginationData = getPagination($, page, 'complete');
        res.status(200).json({ status: 'success', pagination: paginationData, data: animeList });

    } catch (error) { handleError(res, error); }
});

// ==========================================
// 3. ENDPOINT: JADWAL RILIS
// ==========================================
app.get('/api/schedule', async (req, res) => {
    try {
        const html = await fetchHtml(`${BASE_URL}/jadwal-rilis/`);
        const $ = cheerio.load(html);
        const scheduleList = [];

        $('.kglist321').each((index, element) => {
            const dayName = $(element).find('h2').text().trim();
            const animeArray = [];
            $(element).find('ul li').each((i, el) => {
                const linkTag = $(el).find('a');
                const title = linkTag.text().trim();
                const link = linkTag.attr('href');
                if (title) {
                    animeArray.push({
                        title: title,
                        endpoint: link ? link.replace(BASE_URL, '') : ''
                    });
                }
            });
            scheduleList.push({ day: dayName, anime_list: animeArray });
        });

        res.status(200).json({ status: 'success', data: scheduleList });

    } catch (error) { handleError(res, error); }
});

// ==========================================
// 4. ENDPOINT: DETAIL ANIME
// ==========================================
app.get('/api/anime/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const html = await fetchHtml(`${BASE_URL}/anime/${slug}/`);
        const $ = cheerio.load(html);

        const mainTitle = $('.jdlrx h1').text().trim();
        const image = $('.fotoanime img').attr('src');
        const infoData = {};
        
        $('.infozingle p').each((i, el) => {
            const text = $(el).text();
            const split = text.split(':');
            if (split.length > 1) {
                const key = split[0].trim().toLowerCase().replace(/\s+/g, '_');
                const value = split.slice(1).join(':').trim();
                infoData[key] = value;
            }
        });

        const synopsis = $('.sinopc').text().trim();
        const episodeList = [];
        $('.episodelist ul li').each((i, el) => {
            const linkTag = $(el).find('a');
            const epTitle = linkTag.text().trim();
            const epLink = linkTag.attr('href');
            const epDate = $(el).find('.zeebr').text().trim();
            if (epTitle && epLink) {
                episodeList.push({
                    title: epTitle,
                    date: epDate,
                    endpoint: epLink.replace(BASE_URL, '')
                });
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                title: mainTitle,
                image: image,
                data: infoData,
                synopsis: synopsis,
                episode_list: episodeList
            }
        });
    } catch (error) { handleError(res, error); }
});

// ==========================================
// 5. ENDPOINT: DETAIL EPISODE
// ==========================================
app.get('/api/episode/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const html = await fetchHtml(`${BASE_URL}/episode/${slug}/`);
        const $ = cheerio.load(html);

        const title = $('.posttl').text().trim();
        const streamUrl = $('.responsive-embed-stream iframe').attr('src');

        const downloadLinks = [];
        $('.download ul li').each((i, el) => {
            const quality = $(el).find('strong').text().trim();
            const links = [];
            $(el).find('a').each((j, link) => {
                links.push({
                    provider: $(link).text().trim(),
                    url: $(link).attr('href')
                });
            });
            downloadLinks.push({ quality: quality, links: links });
        });

        const info = {};
        $('.infozingle p').each((i, el) => {
            const text = $(el).text();
            const split = text.split(':');
            if (split.length > 1) {
                const key = split[0].trim().toLowerCase().replace(/\s+/g, '_');
                const value = split.slice(1).join(':').trim();
                info[key] = value;
            }
        });

        const seeAllEndpoint = $('.flir a').attr('href') ? $('.flir a').attr('href').replace(BASE_URL, '') : null;

        res.status(200).json({
            status: 'success',
            data: {
                title: title,
                stream_url: streamUrl,
                download_links: downloadLinks,
                info: info,
                nav: { parent_anime: seeAllEndpoint }
            }
        });

    } catch (error) { handleError(res, error); }
});


// ==========================================
// HELPER FUNCTIONS
// ==========================================
function getPagination($, currentPage, type) {
    const paginationData = {
        currentPage: currentPage,
        hasNextPage: false,
        nextPageEndpoint: null,
        totalPages: null
    };
    const nextButton = $('.pagination .next.page-numbers');
    if (nextButton.length > 0) {
        paginationData.hasNextPage = true;
        paginationData.nextPageEndpoint = `/api/${type}/${currentPage + 1}`;
    }
    const lastPageElement = $('.pagination .page-numbers').not('.next').last();
    if (lastPageElement.length > 0) {
        paginationData.totalPages = Number(lastPageElement.text());
    }
    return paginationData;
}

function handleError(res, error) {
    console.error(`Error:`, error.message);
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ status: 'error', message: 'Halaman tidak ditemukan' });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
}

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});