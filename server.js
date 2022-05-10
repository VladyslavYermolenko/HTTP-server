const http = require('http');

function logRequest({method, url}) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`);
}

const server = http.createServer((req, res) => {
    logRequest(req);

    let pathToTheResource = req.url.split('?')[0];
    switch (pathToTheResource) {
        case '/headers':
            const { headers, method } = req;
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(headers));
            break;

        case '/plural':
            function plural(count, one, few, many) {
                let form = '';
                const x = count % 10;
                if (x === 0 || (count >= 10 && count <= 20)) {
                    form = many;
                } else if (x === 1) {
                    form = one;
                } else if (x < 5 && count ) {
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
            break;    

        case '/frequency':
            function wordCount(text) {
                let wordsMap = new Map();
                wordsMap = text.toLowerCase()
                    .replace(/[^a-z0-9\s]/gi, '')
                    .split(' ')
                    .reduce((a, el) => {
                        a[el] = (a[el] || 0) + 1;
                        return a;
                    }, {});
                return wordsMap;
            }
            let txt = '';
            req.on('data', data => {
                txt += data;
            });

            req.on('end', () => {
                
            });

            console.log(txt);
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