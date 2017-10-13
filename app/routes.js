var express = require('express');
var router = express.Router(); 
var request = require('request');

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here
var url = 'http://api.postcodefinder.royalmail.com/CapturePlus/Interactive/Find/v2.00/json3ex.ws?Key=BH89-YF22-ZU91-EE62&Country=GBR';
var formattedurl = "http://api.postcodefinder.royalmail.com/CapturePlus/Interactive/RetrieveFormatted/v2.00/json3ex.ws?Key=BH89-YF22-ZU91-EE62";

router.get('/api/address-lookup', function(req, res) {
    var postcode = req.query.postcode;
    var number = req.query.number;
    var addressList = [];

    if (postcode !== undefined) {
        var scopeurl = url + '&SearchTerm=' + postcode;

        if (number !== undefined) {
            scopeurl += ', ' + number;
        }

        request(encodeURI(scopeurl), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var addresses = JSON.parse(body).Items;

                loopDetailRequest(addresses, addressList, res);        
            }
        });
    } else {
        res.json("error");
    }

    //res.json([postcode]);
});

function loopDetailRequest(addresses, addressList, res) {
    if (addresses.length !== 0) {
        var detailurl = formattedurl + '&Id=' + addresses[0].Id;

        request(encodeURI(detailurl), function (er, resp, bod) {
            if (!er && resp.statusCode == 200) {
                var jsonbod = JSON.parse(bod);

                // Pass the address details onto the address list
                // Results can be bilingual... check if we're obtaining english
                if (jsonbod.Items[0].Language === 'ENG') {
                    addressList.push(jsonbod.Items[0]);
                } else {
                    addressList.push(jsonbod.Items[1]);
                }

                // Delete the first address
                addresses.splice(0, 1);

                // Pass the addresses back in for the next request
                loopDetailRequest(addresses, addressList, res);
            }
        });
    } else {
        // If there's no data left to request, return the address list
        res.json(addressList);
    }

}

module.exports = router
