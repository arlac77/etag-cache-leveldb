export class ETagCacheLevelDB {
  #db;

  constructor(db) {
    this.#db = db;
  }

  header(url) {
    this.#db.get(url);

    const entry = this.#entries.get(url);
    if (entry) {
      console.log("found", url, entry[0]);
    }
    return entry ? { "If-Match": entry[0] } : {};
  }

  data(url) {
    const entry = this.#entries.get(url);
    return entry ? entry[1] : undefined;
  }

  store(url, etag, json) {
    this.#db.put(url, etag);
  }
}
