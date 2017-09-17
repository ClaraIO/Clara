/**
 * @file Sagiri thin client for Clara
 * @author Capuccino
 * @author Ovyerus
 * @todo Finish off url list and make lib return as many results as wanted
 * @todo asyncify
 */

const Multipart = require('multi-part');
const fs = require('fs');
const https = require('https');

/** 
 * Query handler for SauceNAO.
 * 
 * @prop {String} key API key
 * @prop {Number} numRes Amount of responses returned from the API.
 */
class SauceHandler {
    /**
     * @param {String} key API Key for SauceNAO
     * @param {Number} numRes amount of responses you want returned from the API. Default is 5 Responses.
     * @see {link} https://saucenao.com/user.php?page=search-api
     */
    constructor(key, numRes) {
        if (!key && typeof key === 'string') { 
          throw new TypeError('No API key provided!');
        this.key = key,
        this.numRes = numRes || 5;
    }

    /**
     * Gets the source and outputs it in your preferred output type
     * 
     * @param {String} file Either a file or URL that you want to find the source of.
     * @returns {Promise<Object>} JSON that contains the closest match.
     * @example client.getSauce(path/link).then(console.log);
     */
    getSauce(file) {
        return new Promise((resolve, reject) => {
            if (typeof file !== 'string') {
                reject(new Error('file is not a string.'));
            } else {
                new Promise((_resolve, _reject) => {
                    if (fs.existsSync(file)) {
                        let form = new Multipart();
                    
                        form.append('api_key', this.key);
                        form.append('output_type', 2);
                        form.append('numres', this.numRes);
                        form.append('file', fs.createReadStream(file));

                        sendForm(form).then(_resolve).catch(_reject);
                    } else {
                        let queryString = `?api_key=${this.key}&output_type=2&numres=${this.numRes}&url=${encodeURIComponent(file)}`;

                        https.request({
                            hostname: 'saucenao.com',
                            path: '/search.php' + queryString,
                            method: 'POST'
                        }, res => {
                            let chunked = '';

                            res.on('data', chunk => chunked += chunk);
                            res.on('error', _reject);
                            res.on('finish', () => _resolve(chunked));
                        }).on('error', _reject);
                    }
                }).then(res => {
                    if (JSON.parse(res).header.status !== 0) {
                        throw new Error("An error occurred (We don't know because SauceNAO is shit).");
                    }
                    
                    let allResults = JSON.parse(res).results;
                    let result;

                    if (allResults.length > 1) {
                        result = allResults.sort((a, b) => Number(b.header.similarity) - Number(a.header.similarity))[0];
                    } else if (allResults.length === 1) {
                        result = allResults[0];
                    } else {
                        throw new Error('No results.');
                    }

                    return {
                        similarity: Number(result.header.similarity),
                        url: resolveSauceURL(result),
                        original: result
                    };
                }).then(resolve).catch(reject);
            }
        });
    }
}

function sendForm(form) {
    return new Promise((resolve, reject) => {
        let req = https.request({
            headers: form.getHeaders(),
            hostname: 'saucenao.com',
            path: '/search.php',
            method: 'POST'
        }, res => {
            let chunked = '';

            res.on('data', chunk => chunked += chunk);
            res.on('error', reject);
            res.on('finish', () => resolve(chunked));
        });

        req.on('error', reject);
        form.stream().pipe(req);
    });
}

// My god SauceNAO is shit
// I could shorten this to hell and back but it'll do for now.
function resolveSauceURL(data) {
    let url;

    switch (data.header.index_name.match(/^Index #(\d+):? /)[1]) {
        case '5':
            // Pixiv
            url = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${data.data.pixiv_id}`;
            break;
        case '8':
            // Nico Nico Seiga
            url = `http://seiga.nicovideo.jp/seiga/im${data.data.seiga_id}`;
            break;
        case '9':
            // Danbooru
            url = `https://danbooru.donmai/us/posts/${data.data.danbooru_id}`;
            break;
        case '10':
            // drawr
            url = `http://drawr.net/show.php?id=${data.data.drawr_id}`;
            break;
        case '11':
            // Nijie
            break;
        case '12':
            // Yande.re
            url = `https://yande.re/post/show/${data.data.yandere_id}`;
            break;
        case '16':
            // FAKKU
            break;
        case '19':
            // 2D-Market
            break;
        case '20':
            // MediBang
            url = data.data.url; // WHY THE FUCK ARE YOU SO BLOODY INCONSISTENT
            break;
        case '21':
            // Anime
            url = `https://anidb.net/perl-bin/animedb.pl?show=anime&aid=${data.data.anidb_aid}`;
            break;
        case '25':
            // Gelbooru
            url = `https://gelbooru.com/index.php?page=post&s=view&id=${data.data.gelbooru_id}`;
            break;
        case '26':
            // Konachan
            url = `https://konachan.com/post/show/${data.data.konachan_id}`;
            break;
        case '27':
            // Sankaku Channel
            break;
        case '28':
            // Anime-Pictures
            url = `https://anime-pictures.net/pictures/view_post/${data.data['anime-pictures_id']}`;
            break;
        case '29':
            // e621
            break;
        case '30':
            // Idol Complex
            break;
        case '31':
            // bcy.net Illust
            break;
        case '32':
            // bcy.net Cosplay
            break;
        case '33':
            // PortalGraphics
            break;
        case '35':
            // Pawoo
            break;
        default:
            throw new Error(`Unsupported site index: ${data.header.index_name.match(/^Index #(\d+):? /)[1]}`);
    }

    return url;
}

module.exports = SauceHandler;