var shortnerService = require('../modules/ShortnerService');

var assert = require('assert');
describe('URL Shortener', function () {
    describe('#process()', function () {
        it('Test to check long & short Urls', function () {
            shortUrls = [];
            var testUrl = allPossibleCombinations('zxcvbn', 6);
         //   testUrl = ['zzzzcx.com','zvnvvb.com']
            console.log(testUrl.length);
            testUrl.forEach(function (url) {

                var urlE = url + '.com';
                shortnerService.Process("", urlE,
                    function (short, error) {
                        assert.equal("", error);
                        shortnerService.Process(short, "",
                            function (long, error) {
                                assert.equal("", error, "long: " + long + " short:" + short + " URL:" + urlE );
                                assert.equal(long, urlE, "long: " + long + " short:" + short + " URL:" + urlE);
                            });
                    });

            });
        });
    });
});


var allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function allPossibleCombinations(str, comb) {
    var arr = [];

    recComb(arr, '', str, comb, 0);

    return arr;
}

function recComb(arr, makingStr, str, comb, level) {
    if (level == 0) {
        for (var i = 0; i < str.length; i++) {
            recComb(arr, str[i], str, comb, 1);
        }
    }
    else if (level != comb) {
        for (var i = 0; i < str.length; i++) {
            recComb(arr, makingStr + str[i], str, comb, level + 1);
        }
    }
    else if (level == comb) {
        arr.push(makingStr);
        return;
    }
}