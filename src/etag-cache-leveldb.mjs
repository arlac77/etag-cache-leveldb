/**
 * Stores etags and bodies into leveldb.
 * Reconstructs response with body if etag or url matches.
 * Will store in the cache:
 * url : etag
 * etag : body
 */
export class ETagCacheLevelDB {
  #db;
  #numberOfStoredRequests = 0;
  #numberOfStoredBytes = 0;
  #numberOfLoadedRequests = 0;
  #numberOfLoadedBytes = 0;

  constructor(db, options) {
    this.#db = db;
  }

  /**
   * Adds the "If-None-Match" header if etag is found for the url.
   * @param {string|URL} url 
   * @param {Object} headers 
   * @returns {boolean} true if etag was found in cache and hader has been added
   */
  async addHeaders(url, headers) {
    try {
      const entry = await this.#db.get(url);

      headers["If-None-Match"] = entry.toString();
      return true;
    } catch {}

    return false;
  }

  /**
   * Deliver statisics data.
   * @return {Object}
   */
  get statistics() {
    return {
      numberOfStoredRequests: this.#numberOfStoredRequests,
      numberOfStoredBytes: this.#numberOfStoredBytes,
      numberOfLoadedRequests: this.#numberOfLoadedRequests,
      numberOfLoadedBytes: this.#numberOfLoadedBytes
    };
  }

  /**
   * Stores response in the cache.
   * @param {Response} response as produced by fetch
   * @returns {Promise<undefined>}
   */
  async storeResponse(response) {
    if (response.ok) {
      try {
        response = response.clone();

        const etag = rawTagData(response.headers.get("etag"));

        if (etag) {
          const promiseA = this.#db.put(response.url, etag);

          const chunks = [];

          for await (const chunk of response.body) {
            chunks.push(chunk);
          }

          const body = chunks.join("");

          this.#numberOfStoredRequests++;
          this.#numberOfStoredBytes += body.length;

          return Promise.all([
            promiseA,
            this.#db.put(etag, body)
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Constructs a new Response feed from the cahce is a matching etag is found in the cache.
   * @param {Response} response as provided by fetch
   * @returns {Response}
   */
  async loadResponse(response) {
    let etag = rawTagData(response.headers.get("etag"));

    try {
      if (!etag) {
        etag = await this.#db.get(response.url);
      }

      const entry = await this.#db.get(etag);

      if (entry) {
        this.#numberOfLoadedRequests++;
        this.#numberOfLoadedBytes += entry.length;

        return new Response(entry, { status: 200 });
      }
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Strips away etag flags (weak ant the like)
 * @param {string} etag 
 * @returns {string} raw etag
 */
export function rawTagData(etag) {
  return etag && etag.replace(/W\//, "");
}
