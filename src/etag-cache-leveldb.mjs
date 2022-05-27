export class ETagCacheLevelDB {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async addHeaders(url, headers) {
    const entry = await this.#db.get(url);

    if (entry) {
      headers["If-Match"] = entry;
    }
  }

  loadResponse(url) {
    const entry = this.#db.get(url);

    if(entry) {
      return new Response(entry);
    }
  }

  storeResponse(response) {
    if (response.ok) {
      const etag = response.headers.get("etag");

      if (etag) {
        response = response.clone();

        this.#db.put(response.url,etag);
        this.#db.put(etag,response.body);
      }
    }
  }
}
