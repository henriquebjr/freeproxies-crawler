'use strict';

let express = require('express');
let app = express();
let cheerio = require('cheerio');
let spawn = require('child_process').spawn;
let url = 'http://www.freeproxylists.net/?c=&pt=&pr=&a%5B%5D=0&a%5B%5D=1&a%5B%5D=2&u=90';

app.get('', function(req, res){
  console.log("new request...");
  let finalData = [];
  let phantom = spawn('phantomjs', ['phantom.js', url]);

  phantom.stdout.on('data', data => {
    finalData.push(data);
  });

  phantom.on('close', () => {
    finalData = Buffer.concat(finalData);
    finalData = JSON.parse(finalData);

    let $ = cheerio.load(finalData.html);
    let $tr = $('.DataGrid tr:not(:first-child)');
    let proxies = [];
    let number = 0;

    $tr.each((index, item) => {
      let $actualTr = $(item);
      let proxy = $actualTr.find('a').text();
      let port = $actualTr.find('td:nth-child(2)').text();
      let country = $actualTr.find('td:nth-child(5)').text();
      if (proxy && port)
        proxies[number++] = { proxy: proxy, port: port, country: country };
    });

    res.end( JSON.stringify(proxies) );
  });
});

let server = app.listen(3000, function() {
  console.log("Listening at port 3000");
})
