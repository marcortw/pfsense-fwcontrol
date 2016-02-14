var cheerio = require('cheerio');

var getCsrf = function (html) {
    // load the html into a jquery-like object
    var $ = cheerio.load(html);
    var options = {};

    // find some javascript stuff and the magictoken
    $('script[type="text/javascript"]').each(function (i, elem) {
        var content = $(this).text();
        if (content.indexOf('csrfMagicToken') > -1) {
            var csrfstuff = content.match(/".*?"/g);

            options.csrftoken_value = csrfstuff[0].replace(/"/g, "");
            options.csrftoken_key = csrfstuff[1].replace(/"/g, "");
        }
    });
    return options;
};

var getInputError = function (html) {
    var $ = cheerio.load(html);

    if ($('#inputerrors')) {
        var error = $('#inputerrors').text();
    }
    return error;
};

var getInputErrors = function (html) {
    var $ = cheerio.load(html);

    if ($('#inputerrorsdiv')) {
        var error = $('#inputerrorsdiv').text();
    }
    return error;
};

var getRuleByDescription = function (html, description) {
    var $ = cheerio.load(html);
    var searchString = 'td:contains(' + description + ')';
    var id = null;

    $('.listbg.descr').each(function () {
        var ruleDescription = $(this).text().trim();
        if(ruleDescription == description){
            var parentHtml = $(this).parent().html();
            $ = cheerio.load(parentHtml);
            id = $(':input').attr("value");
        }
    });

    return id;
};

module.exports = {
    getCsrfToken: getCsrf,
    getInputError: getInputError,
    getInputErrors: getInputErrors,
    getRuleByDescription: getRuleByDescription
};
