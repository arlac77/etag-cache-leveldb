import test from "ava";
import tmp from "tmp";
import levelup from "levelup";
import leveldown from "leveldown";
import { ETagCacheLevelDB } from "etag-cache-leveldb";

test("initialize", async t => {
  const location = tmp.tmpNameSync();
  const db = await levelup(leveldown(location));

  t.true(db.supports.promises, "promises");

  console.log(location);

  const cache = new ETagCacheLevelDB(db);

  const url = "http://mydomain.com/";

  cache.store(url, "cccc", {});

  t.deepEqual(cache.header(url), {});
});
