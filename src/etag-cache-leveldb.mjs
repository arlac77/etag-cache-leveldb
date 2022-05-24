

export class ETagCacheLevelDB {

  #db;

  constructor(db) {
    this.#db = db;
  }

  header(url) {
    const entry = this.#db.get(url);

    return entry ? { "If-Match": entry } : {};
  }

  data(url) {
    const entry = this.#db.get(url);
    return entry ? entry[1] : undefined;
  }

  store(url, etag, json) {
    return this.#db.put(url, etag);
  }
}
