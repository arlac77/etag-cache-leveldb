/**
 * Stores etags and bodies into leveldb.
 * reconstructs response with body if etag or url matches.
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

        const etag = raw(await response.headers.get("etag"));

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

  async loadResponse(response) {
    let etag = raw(await response.headers.get("etag"));

    try {
      if (!etag) {
        console.log("no etag header found using url", response.url);
        etag = await this.#db.get(response.url);
      }

      const entry = await this.#db.get(etag);
      console.log(
        "loadResponse",
        response.url,
        etag,
        entry ? entry.length : "null"
      );

      if (entry) {
        return new Response(entry, { status: 200 });
      }
    } catch (e) {
      console.log(e, etag);
    }
  }
}

function raw(etag)
{
  return etag.replace(/W\//,'');
}