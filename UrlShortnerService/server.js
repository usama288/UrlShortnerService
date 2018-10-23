var express = require('express'),
    levelup = require('levelup'),
    leveldown = require('leveldown'),
    level = require('level'),
    app = express(),
    fs = require("fs"),
    bodyParser = require('body-parser'),
    urlShortnerService = require('./modules/ShortnerService');

const { check, validationResult } = require('express-validator/check');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/api/process', [
    check('LongUrl').optional().isURL().withMessage("Invalid Long Url"),
    check('ShortUrl').optional().matches(/(https:)?(\/\/www.)?(t.co\/)[a-zA-Z0-9]{7}/).withMessage("Invalid Short Url, short url format is [https://t.co/abcdefgh]")
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

    var body = req.body;

    if (!body.ShortUrl && !body.LongUrl) {
        return res.status(422).json({
            shortUrl: body.ShortUrl,
            longUrl: body.LongUrl,
            result: "",
            error: "Both Short & Long Url cannot be null, either one is required"
        }
        );
    }

    var shortCode = urlShortnerService.Process(body.ShortUrl, body.LongUrl, function (result, error) {
        return res.status(200).json({
            shortUrl: body.ShortUrl,
            longUrl: body.LongUrl,
            result: result,
            error: error
        }
        );
    });
});

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("URL Shorten service listening at http://%s:%s", host, port)

})