/**
 * Stores etags and bodies nto leveldb.
 * reconstructs response with body if response matches.
 * will store in the cache:
 * url : etag
 * etag : body
 */
export class ETagCacheLevelDB {
  #db;

  constructor(db, options) {
    this.#db = db;
  }

  async addHeaders(url, headers) {
    try {
      const entry = await this.#db.get(url);

      headers["If-Match"] = entry.toString();
    } catch {}
  }

  async loadResponse(url) {
    const entry = this.#db.get(url);

    if (entry) {
      return new Response(entry);
    }
  }

  async storeResponse(response) {
    if (response.ok) {
      response = response.clone();

      const etag = await response.headers.get("etag");

      if (etag) {
        console.log("store", etag);
        await this.#db.put(response.url, etag);

        const chunks = [];

        for await (const chunk of response.body) {
          //console.log("read body", chunk.length);
          chunks.push(chunk);
        }

        const body = chunks.join("");
        console.log("store body", body.length);
        await this.#db.put(etag, body);
      }
    }
  }
}
