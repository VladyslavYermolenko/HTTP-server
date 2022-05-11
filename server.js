const http = require('http');

function logRequest({ method, url }) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`);
}

const server = http.createServer((req, res) => {
    logRequest(req);
    const { headers, method } = req;
    let pathToTheResource = req.url.split('?')[0];
    switch (pathToTheResource) {
        case '/headers':
            if (method == 'GET') {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(headers));
            }
            else {
                res.writeHead(404, 'Not Found');
                res.end();
            }
            break;

        case '/plural':
            if (method == 'GET') {
                function plural(count, one, few, many) {
                    let form = '';
                    const x = count % 10;
                    if (x === 0 || (count >= 10 && count <= 20)) {
                        form = many;
                    } else if (x === 1) {
                        form = one;
                    } else if (x < 5 && count) {
                        form = few;
                    } else {
                        form = many;
                    }
                    return count + ' ' + form;
                }
                const url = new URL(req.url, `http://${req.headers.host}`);
                let number = url.searchParams.get('number');
                let forms = decodeURI(url.searchParams.get('forms')).split(',');

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });

                res.end(plural(number, forms[0], forms[1], forms[2]));
            }
            else {
                res.writeHead(404, 'Not Found');
                res.end();
            }
            break;

        case '/frequency':
            if (method == 'POST') {
                function wordCount(text) {
                    let wordsMap = text.toLowerCase()
                        .replace(/[^a-z0-9\s]/gi, '')
                        .split(' ')
                        .reduce((previousValue, currentValue) => {
                            previousValue[currentValue] = (previousValue[currentValue] || 0) + 1;
                            return previousValue;
                        }, {});
                    return wordsMap;
                }

                function mostFrequentWord(words) {
                    let mostKey = '';
                    let mostValue = 0;
                    for (let key in words) {
                        if (words[key] > mostValue) {
                            mostValue = words[key];
                            mostKey = key;
                        }
                    }
                    return mostKey;
                }

                let text = '';
                req.on('data', data => text += data);

                req.on('end', () => {
                    const words = wordCount(text);
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Number-of-Unique-Words': Object.keys(words).length,
                        'Most-Frequent-Word': mostFrequentWord(words)
                    });
                    res.end(JSON.stringify(wordCount(text)));
                });
            }
            else {
                res.writeHead(404, 'Not Found');
                res.end();
            }
            break;

        default:
            res.writeHead(404, 'Not Found');
            res.end();
    }
});

const port = 5000;
server.listen(port, () => {
    console.log(`Server started at localhost:${port}`);
});  
