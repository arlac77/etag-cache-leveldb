import test from "ava";
import tmp from "tmp";
import { mkdir } from "fs/promises";
import levelup from "levelup";
import leveldown from "leveldown";
import { ETagCacheLevelDB } from "etag-cache-leveldb";

test("initialize", async t => {
  const dir = new URL("../build", import.meta.url).pathname;
  await mkdir(dir,{ recursive: true});

  const db = await levelup(leveldown(dir));

  t.true(db.supports.promises, "promises");

  const cache = new ETagCacheLevelDB(db);

  const url = "http://mydomain.com/";
  const etag = "abc";

  let headers = { etag };
  headers.get = k => headers[k];
  
  const response = { ok: true, url, headers, body: "", clone() { return this; }  };

  cache.storeResponse(response);

  headers = {};
  
  cache.addHeaders(url,headers);

  t.deepEqual(headers,{});
});
