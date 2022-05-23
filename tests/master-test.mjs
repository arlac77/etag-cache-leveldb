import test from "ava";
import tmp from "tmp";
import levelup from "levelup";
import leveldown from "leveldown";
import { ETagCacheLevelDB } from "etag-cache-leveldb";

test("initialize", async t => {
  const db = await levelup(leveldown(tmp.tmpNameSync()));

  const cache = new ETagCacheLevelDB(db);

  t.deepEqual(cache.header("xxx"),{});
});

