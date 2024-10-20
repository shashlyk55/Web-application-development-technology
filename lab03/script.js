const http = require("http")
const fs = require("fs")
const path = require('path')


const parseCookies = (cookieHeader) => {
    return cookieHeader?.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
      return cookies;
    }, {}) || {};
};

const server = http.createServer((req, res) => {

    if(req.url === '/'){
        fs.readFile(path.join(__dirname, 'index.html'), (err, html) => {
            if(err){
                res.writeHead(500, {'Content-Type':'text/plain'})
                res.end('Server error')
            } else {
                res.writeHead(200, {'Content-Type':'text/html'})
                res.end(html)
            }
        })
    } else if(req.url === '/api' && req.method === 'POST'){
        let body = ''
        
        req.on('data', (chunk) => {
            body += chunk.toString()
        })

        req.on('end', () => {
            const cookies = req.headers.cookie
            const parsedBody = JSON.parse(body)
            
            if(cookies == null) {
                console.log('no cookie in req');
                
                res.statusCode = 200 // response is empty
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Set-Cookie', [
                    `sx=${parsedBody.x};`,
                    `sy=${parsedBody.y};`,
                    `reqCount=${1}`
                ])
                res.end(JSON.stringify({
                    sx: parsedBody.x,
                    sy: parsedBody.y
                }))

            } else {
                console.log('cookie in req');

                const parsedCookie = parseCookies(cookies)

                console.log(parsedCookie)

                let cookie_sx = parseInt(parsedCookie.sx)
                let cookie_sy = parseInt(parsedCookie.sy)
                let cookie_reqCount = parseInt(parsedCookie.reqCount)

                let sumX = parsedBody.x
                let sumY = parsedBody.y

                if(cookie_reqCount % 5 !== 0){
                    sumX = parsedBody.x + cookie_sx
                    sumY = parsedBody.y + cookie_sy
                } 

                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Set-Cookie', [
                    `sx=${sumX}`,
                    `sy=${sumY}`,
                    `reqCount=${++cookie_reqCount}`
                ])

                // for postman tests
                /*res.statusCode = 200
                    res.end(JSON.stringify({
                        sx: sumX,
                        sy: sumY
                    }))*/

                if(cookie_reqCount % 5 === 0){
                    console.log('sending sum');
                    
                    res.statusCode = 200
                    res.end(JSON.stringify({
                        sx: sumX,
                        sy: sumY
                    }))
                } else {
                    res.statusCode = 204 // response is empty
                    res.end()
                }
            }       
        })        
    }
})

const PORT = 5000
const HOSTNAME = 'localhost'
server.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
    
})



