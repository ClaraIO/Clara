/* SauceNao query Handler
 * 
 * 
 * Contributed by Capuccino
 */

const got = require('got');
const urlRegex = str => /(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi.test(str);

/** 
 * Query Handler for SauceNao-related requests.
 */

class SauceHandler {
    /**
     * @param {Object} options Object for overriding the query system for API. valid parameters are outputType (the type of output you want) and numRes (number of responses you want returned) 
     * @param {String} apiKey the API key for interacting with sauceNao
     * @see {link} https://saucenao.com/user.php?page=search-api
     */
    constructor(options = {}, apiKey) {
        this.apiKey = apiKey;
        this.options = {
            outputType: this.options.outputType || 2,
            numRes: this.options.numRes || 5
        };
        if (!this.apiKey || !apiKey === typeof string) {
            throw new TypeError('No API Key or invalid key was provided');
        }
    }
    /**
     * Gets the source and outputs it in your preffered output type
     * @param {String} path filepath for the image you want to get the source from (Not Implemented yet).
     * @param {String} link web address for the source, must be a valid HTTP/HTTPS address.
     * @returns {Promise} and JSON output.
     * @example client.getSauce(path/link).then(res => { console.log(res) });
     */
    getSauce(path, link) {
        return new Promise((resolve, reject) => {
            if (!path === typeof path) {
                throw new TypeError('path is not string');
            } else if (path) {
                /** @todo Finalize this. We need to input file as a stream then convert to MIMEType */
                throw new Error('This is not implemented yet!');
                /* got(`http://saucenao.com/search.php?output_type=${this.options.outputType}&numres=${this.options.numRes}&api_key=${this.apiKey}`, {}).then(res => {               
                 });*/
            } else if (link) {
                if (!urlRegex) {
                    throw new Error('Link is not valid HTTP/HTTPS Address.');
                } else {
                    /** @todo I need a regex for making the following URL in the URL parameter */
                    got(`http://saucenao.com/search.php?output_type=${this.options.outputType}&numres=${this.options.numRes}&api_key=${this.apiKey}&url=${encodeURIComponent(link)}`).then(res => {
                        resolve(res.body);
                    }).catch(reject);
                }
            }
        });
    }
}

module.exports = SauceHandler;