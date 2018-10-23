var md5 = require('md5'),
    levelup = require('levelup'),
    leveldown = require('leveldown'),
    level = require('level');


var db = level('./ShortCodes', { valueEncoding: 'json' });
var locks = require('locks');
const shortCodeSize = 7;
var mutex = locks.createMutex();

function convertToMd5(Url) {

    if (Url) {
        return md5(Url);
    } else {
        return "";
    }
}

function encodeBase64(md5Hash) {
    if (md5Hash) {
        let buff = new Buffer(md5Hash);
        return buff.toString('base64');
    } else {
        return "";
    }
}


exports.Process = function (shortUrl, longUrl, fn) {
    if (longUrl) {
        SaveShortenUrl(longUrl, function (longUrl, error) {
            fn(longUrl, error);
        });
    } else if (shortUrl) {
        fetchUrl(shortUrl, function (longUrl, error) {
            fn(longUrl, error);
        });
    }

}


function SaveShortenUrl(longUrl, fn) {
    let hash = convertToMd5(longUrl);
    let base = encodeBase64(hash);
    processHash(longUrl, 0, base, function (key, error) {
        fn(key, error);
    });

}

function fetchUrl(shortUrl, fn) {
    var shortCode = shortUrl.substr(shortUrl.length - shortCodeSize);
    db.get(shortCode, function (error, data) {
        if (error) {
            console.log("error for shortUrl[" + shortUrl + "]");
            fn("", error.type);
        } else if (data) {
            fn(data.longUrl, "");
        }
    });
}

function processHash(longUrl, startIndex, hash, fn) {
    if (hash.length < shortCodeSize || hash.substr(startIndex, shortCodeSize).length < shortCodeSize) {
        fn("","Maximum Short Urls generated");
    }
    var shortCode = hash.substr(startIndex, shortCodeSize);
    mutex.lock(function () {
        db.get(shortCode, function (error, value) {
            if (error) {
                if (error.type == "NotFoundError") {
                    db.put(shortCode, {
                        "longUrl": longUrl,
                        "createdAt": new Date()
                    }, function () {
                        mutex.unlock();
                        fn(shortCode, "");

                    });
                }
                else {
                    mutex.unlock();
                    fn("", error.type);
                }
            }
            else if (value) {
                if (value.longUrl == longUrl) {
                    mutex.unlock();
                    fn(shortCode, "");
                } else {
                    mutex.unlock();
                    processHash(longUrl, startIndex + shortCodeSize, hash, fn);
                }
            }
        });
    });
}