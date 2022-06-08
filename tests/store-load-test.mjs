import test from "ava";
import { mkdir } from "fs/promises";
import levelup from "levelup";
import leveldown from "leveldown";
import { ETagCacheLevelDB } from "etag-cache-leveldb";
import fetch from "node-fetch";

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

  t.is(headers["If-None-Match"], etag);

  const response2 = await fetch(url, { headers });

  t.is(response2.status, 304);

  const response3 = await cache.loadResponse(url);

  t.is(response.status, 200);

  const json = await response3.json();

  t.is(json.current_user_url, "https://api.github.com/user");  
});
