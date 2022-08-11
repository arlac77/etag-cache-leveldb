[![npm](https://img.shields.io/npm/v/etag-cache-leveldb.svg)](https://www.npmjs.com/package/etag-cache-leveldb)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Open Bundle](https://bundlejs.com/badge-light.svg)](https://bundlejs.com/?q=etag-cache-leveldb)
[![downloads](http://img.shields.io/npm/dm/etag-cache-leveldb.svg?style=flat-square)](https://npmjs.org/package/etag-cache-leveldb)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/etag-cache-leveldb.svg?style=flat-square)](https://github.com/arlac77/etag-cache-leveldb/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Fetag-cache-leveldb%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/etag-cache-leveldb/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/etag-cache-leveldb/badge.svg)](https://snyk.io/test/github/arlac77/etag-cache-leveldb)
[![Coverage Status](https://coveralls.io/repos/arlac77/etag-cache-leveldb/badge.svg)](https://coveralls.io/github/arlac77/etag-cache-leveldb)

# etag-cache-leveldb

etag cache based on leveldb

# example

```js
import levelup from "levelup";
import leveldown from "leveldown";
import { ETagCacheLevelDB } from "etag-cache-leveldb";

const someDirectory = "/tmp";
const db = await levelup(leveldown(someDirectory));
const cache = new ETagCacheLevelDB(db);

const url = "https://api.github.com/";

const response = await fetch(url);

await cache.storeResponse(response);

// later

const headers = {};

await cache.addHeaders(url, headers); // fill in etag header

const responseWithETag = await fetch(url, { headers });
const cachedResponse = await cache.loadResponse(responseWithETag);
```

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [ETagCacheLevelDB](#etagcacheleveldb)
    *   [Parameters](#parameters)
    *   [addHeaders](#addheaders)
        *   [Parameters](#parameters-1)
    *   [statistics](#statistics)
    *   [storeResponse](#storeresponse)
        *   [Parameters](#parameters-2)
    *   [loadResponse](#loadresponse)
        *   [Parameters](#parameters-3)
*   [rawTagData](#rawtagdata)
    *   [Parameters](#parameters-4)

## ETagCacheLevelDB

Stores etags and bodies into leveldb.
Reconstructs response with body if etag or url matches.
Will store in the cache:
url : etag
etag : body

### Parameters

*   `db`  
*   `options`  

### addHeaders

Adds the "If-None-Match" header if etag is found for the url.

#### Parameters

*   `url` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [URL](https://developer.mozilla.org/docs/Web/API/URL/URL))** 
*   `headers` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if etag was found in cache and hader has been added

### statistics

Deliver statisics data.

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### storeResponse

Stores response in the cache.

#### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** as produced by fetch

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined)>** 

### loadResponse

Constructs a new Response feed from the cahce is a matching etag is found in the cache.

#### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** as provided by fetch

Returns **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** 

## rawTagData

Strips away etag flags (weak ant the like)

### Parameters

*   `etag` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** raw etag
