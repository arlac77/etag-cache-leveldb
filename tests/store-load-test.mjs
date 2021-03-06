import test from "ava";
import { mkdir } from "node:fs/promises";
import levelup from "levelup";
import leveldown from "leveldown";
import fetch, { Response } from "node-fetch";
import { ETagCacheLevelDB, rawTagData } from "etag-cache-leveldb";

if (!globalThis.Response) {
  globalThis.Response = Response;
}

test("header store load", async t => {
  const dir = new URL("../build", import.meta.url).pathname;
  await mkdir(dir, { recursive: true });

  const db = await levelup(leveldown(dir));

  const cache = new ETagCacheLevelDB(db);

  const url = "https://api.github.com/";

  const response = await fetch(url);

  const etag = response.headers.get("etag");

  await cache.storeResponse(response);

  const headers = {};

  await cache.addHeaders(url, headers);

  t.is(rawTagData(headers["If-None-Match"]), rawTagData(etag));

  const response2 = await fetch(url, { headers });

  t.is(response2.status, 304);

  const response3 = await cache.loadResponse(response2);

  t.is(response.status, 200);
  t.true(response.ok);

  const json = await response3.json();

  t.is(json.current_user_url, "https://api.github.com/user");

  t.is(cache.statistics.numberOfLoadedRequests,1);
  t.true(cache.statistics.numberOfLoadedBytes > 1000);
  t.is(cache.statistics.numberOfStoredRequests,1);
  t.true(cache.statistics.numberOfStoredBytes > 1000);
});
