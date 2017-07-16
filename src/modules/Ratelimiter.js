/**
 * Custom ratelimitr because Eris buckets are meme.
 * 
 * @prop {Number} totalUses Amount of times the ratelimiter can be used before being ratelimited.
 * @prop {Number} interval Interval between resetting amount of uses.
 * @prop {Number} uses Number of current uses this interval has.
 */
class Ratelimiter {
    /**
     * Constructs a new ratelimiter.
     * 
     * @param {Number} totalUses The total amount of uses the ratelimiter can be used before
     * @param {Number} interval 
     */
    constructor(totalUses, interval) {
        if (typeof totalUses !== 'number') throw new TypeError('totalUses is not not a number.');
        if (typeof interval !== 'number') throw new TypeError('interval is not not a number.');

        this.totalUses = totalUses;
        this.interval = interval;
        this.uses = 0;
        this._timer = setInterval(() => this.uses = 0, interval);
    }

    use() {
        if (this.uses !== this.totalUses) {
            this.uses++;
        }
    }
}

module.exports = Ratelimiter;