export class ETagCacheLevelDB {
  #db;

  constructor(db, options) {
    this.#db = db;
  }

  async addHeaders(url, headers) {
    const entry = await this.#db.get(url);

    if (entry) {
      headers["If-Match"] = entry;
    }
  }

  async loadResponse(url) {
    const entry = this.#db.get(url);

    if(entry) {
      return new Response(entry);
    }
  }

  async storeResponse(response) {
    if (response.ok) {
      const etag = response.headers.get("etag");

      if (etag) {
        response = response.clone();

        console.log("store", etag);
        this.#db.put(response.url, etag);

        try {
        const chunks = [];
        
        for await (const chunk of response.body) {
          console.log("read body", chunk.length);
          chunks.push(chunk);
        }

        console.log("store body",chunks.join('').length);        

        await this.#db.put(etag, chunks.join(''));
        }
        catch(e) {
        console.log(e);
        	throw e;
        }
      }
    }
  }
}
