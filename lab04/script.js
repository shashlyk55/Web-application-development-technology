const http = require("http")
const fs = require("fs")
const path = require('path')
const crypto = require('crypto')


const sessionStore = {}
const generateSessionId = () => crypto.randomBytes(16).toString('hex')

const parseCookies = (cookieHeader) => {
    return cookieHeader?.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
      return cookies;
    }, {}) || {};
};

const server = http.createServer((req, res) => {

    const cookies = req.headers.cookie
    const parsedCookie = parseCookies(cookies)
    console.log(parsedCookie)

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
            
            const parsedBody = JSON.parse(body)
            let sessionId = parsedCookie['sessionId']

            if((!sessionId) || (!sessionStore[sessionId])) {
                console.log('no session id');

                sessionId = generateSessionId()
                sessionStore[sessionId] = { 
                    reqCount: 1,
                    sx: parsedBody.x,
                    sy: parsedBody.y
                }
                
                res.statusCode = 200 
                res.setHeader('Set-Cookie', `sessionId=${sessionId}`)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                    sx: parsedBody.x,
                    sy: parsedBody.y
                }))

            } else {
                console.log('there is session id');

                let cookie_sessionId = parsedCookie.sessionId
                let currentSession = sessionStore[cookie_sessionId]

                currentSession.reqCount++
                currentSession.sx += parsedBody.x
                currentSession.sy += parsedBody.y

                let x = currentSession.sx
                let y = currentSession.sy

                if(currentSession.reqCount % 5 === 0){
                    currentSession.sx = 0
                    currentSession.sy = 0
                } 

                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Set-Cookie', `sessionId=${sessionId}`)

                // for postman tests
                res.statusCode = 200
                    res.end(JSON.stringify({
                        sx: x,
                        sy: y
                    }))
            }       
        })        
    }
})

const PORT = 5000
const HOSTNAME = 'localhost'
server.listen(PORT, HOSTNAME, () => {
    console.log(`Server started on ${HOSTNAME}:${PORT}`);
    
})



