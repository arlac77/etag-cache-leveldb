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

      headers["If-None-Match"] = entry.toString();
    } catch {}
  }

  async storeResponse(response) {
    if (response.ok) {
      try {
        response = response.clone();

        const etag = await response.headers.get("etag");

        if (etag) {
          await this.#db.put(response.url, etag);

          const chunks = [];

          for await (const chunk of response.body) {
            //console.log("read body", chunk.length);
            chunks.push(chunk);
          }

          const body = chunks.join("");
          await this.#db.put(etag, body);

          console.log("storeResponse", response.url, etag, body.length);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  async loadResponse(url) {
    try {
      const etag = await this.#db.get(url);
      console.log("loadResponse", url, etag);
      const entry = await this.#db.get(etag);

      if (entry) {
        return new Response(entry, { status: 200 });
      }
    } catch (e) {
      console.log(e);
    }
  }
}
