export class ETagCacheLevelDB {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async addHeaders(url, headers) {
    try {
      return (headers["If-Match"] = String.fromCharCode.apply(
        null,
        await this.#db.get(url)
      ));
    } catch {}
  }

  async loadResponse(url) {
    const entry = await this.#db.get(url);
    return new Response(entry);
  }

  async storeResponse(response) {
    if (response.ok) {
      const etag = await response.headers.get("etag");

      if (etag) {
        response = response.clone();

        await this.#db.put(response.url, etag);
        await this.#db.put(etag, response.body);
      }
    }
  }
}
