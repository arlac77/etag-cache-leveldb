import { readFile, writeFile } from "fs/promises";

export class ETagCacheLevelDB {

  constructor(fileName) {
    this.fileName = fileName;
  }

  header(url) {
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
    //    console.log("store", url, etag);
    this.#entries.set(url, [etag, json]);
    this.persist();
  }
}
