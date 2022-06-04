import test from "ava";
import { mkdir } from "fs/promises";
import levelup from "levelup";
import leveldown from "leveldown";
import { ETagCacheLevelDB } from "etag-cache-leveldb";
import fetch from "node-fetch";

test("initialize", async t => {
  const dir = new URL("../build", import.meta.url).pathname;
  await mkdir(dir, { recursive: true });

  const db = await levelup(leveldown(dir));

  t.true(db.supports.promises, "promises");

  const cache = new ETagCacheLevelDB(db);

  const url = "https://api.github.com/";

  const response = await fetch(url);

  const etag = response.headers.get('etag');
  
  /*
  const etag = "abc";
  let headers = { etag };
  headers.get = k => headers[k];
  
  const response = { ok: true, url, headers, body: "", clone() { return this; }  };
*/

  await cache.storeResponse(response);

  const headers = {};
  
  await cache.addHeaders(url, headers);

  //console.log(headers['If-Match']);
  
  t.is(headers['If-Match'], etag);

  const response2 = await fetch(url, { headers });

  t.is(response2.status, 200);
});
