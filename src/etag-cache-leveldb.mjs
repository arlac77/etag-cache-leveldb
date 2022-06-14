/**
 * Stores etags and bodies into leveldb.
 * reconstructs response with body if etag or url matches.
 * will store in the cache:
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

  async addHeaders(url, headers) {
    try {
      const entry = await this.#db.get(url);

      headers["If-None-Match"] = entry.toString();
    } catch {}
  }

  get statistics() {
    return {
      numberOfStoredRequests: this.#numberOfStoredRequests,
      numberOfStoredBytes: this.#numberOfStoredBytes,
      numberOfLoadedRequests: this.#numberOfLoadedRequests,
      numberOfLoadedBytes: this.#numberOfLoadedBytes
    };
  }

  async storeResponse(response) {
    if (response.ok) {
      try {
        response = response.clone();

        const etag = rawTagData(response.headers.get("etag"));

        if (etag) {
          const chunks = [];

          for await (const chunk of response.body) {
            chunks.push(chunk);
          }

          const body = chunks.join("");

          /* if(options.report) {
            console.log("storeResponse", response.url, etag, body.length);
          }*/

          this.#numberOfStoredRequests++;
          this.#numberOfStoredBytes += body.length;

          return Promise.all([
            this.#db.put(response.url, etag),
            this.#db.put(etag, body)
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  async loadResponse(response) {
    let etag = rawTagData(response.headers.get("etag"));

    try {
      if (!etag) {
        etag = await this.#db.get(response.url);
      }

      const entry = await this.#db.get(etag);

      /*if (options.report) {
        options.report("loadResponse", response.url, etag);
      }*/

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

export function rawTagData(etag) {
  return etag.replace(/W\//, "");
}
