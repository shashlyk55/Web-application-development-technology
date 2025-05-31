const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
const crypto = require('crypto')

const generateId = () => crypto.randomBytes(16).toString('hex')
const staticDir = path.join(__dirname, 'static')

let etag = generateId()

setInterval(() => {
    etag = generateId()
}, 10000)

let cache_parm = null

const httpHandler = (req, res) => {

    const pathname = url.parse(req.url).pathname

    if(req.method === 'GET') {
        if(pathname === '/'){
            const queryParams = url.parse(req.url,true).query
            cache_parm = queryParams ? queryParams.cache_parm : null

            fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                if(err) {
                    console.log(err)
                    res.writeHead(500, {'Content-Type': 'text/plain'})
                    res.end('server error')
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'})
                    res.end(data)
                }
            })
        } else if(pathname === '/img') {
            const file = path.join(staticDir, 'chill.png');
            const now = new Date()

            fs.readFile(file, (err, data) => {
                if(err) {
                    console.log(err)
                    res.writeHead(500, {'Content-Type': 'text/plain'})
                    res.end('server error')
                } else {
                    console.log('send response with image')

                    res.setHeader('Last-Modified', now.toLocaleString());
                    res.setHeader('ETag', generateId())
                    res.setHeader('Expires', now.setSeconds(now.getSeconds() + 30))
                    res.setHeader('Cache-Control', cache_parm ? `max-age=${cache_parm}` : 'no-store')
                    res.writeHead(200, {'Content-Type': 'image/png'})
                    res.end(data)
                }
            })
        } else if(pathname === '/script') {
            const file = path.join(staticDir, 'script.js');
            const now = new Date()

            fs.readFile(file, (err, data) => {
                if(err) {
                    console.log(err)
                    res.writeHead(500, {'Content-Type': 'text/plain'})
                    res.end('server error')
                } else {
                    console.log('send response with js')

                    /*const lastModified = now

                    const ifModifiedSince = req.headers['if-modified-since'];
                    if (ifModifiedSince && new Date(ifModifiedSince) >= now) {
                        console.log('Resource not modified, returning 304');
                        res.statusCode = 304
                    }*/

                    res.setHeader('Last-Modified', now.toLocaleString());
                    res.setHeader('ETag', generateId())
                    res.setHeader('Expires', now.setSeconds(now.getSeconds() + 30))
                    res.setHeader('Cache-Control', cache_parm ? `max-age=${cache_parm}` : 'no-store')
                    res.writeHead(200, {'Content-Type': 'text/javascript'})
                    res.end(data)
                }
            })
        } else if(pathname === '/style') {
            const file = path.join(staticDir, 'style.css');

            const now = new Date()

            fs.readFile(file, (err, data) => {
                if(err) {
                    console.log(err)
                    res.writeHead(500, {'Content-Type': 'text/plain'})
                    res.end('server error')
                } else {
                    console.log('send response with css')


                    const clientEtag = req.headers['if-none-match']

                    if (clientEtag === etag) {
                        res.statusCode = 304
                    } else {
                        res.statusCode = 200
                    }

                    res.setHeader('Last-Modified', (new Date()).toLocaleString());
                    res.setHeader('ETag', etag)
                    res.setHeader('Expires', (new Date(now.setSeconds(now.getSeconds() + 30))).toLocaleString());
                    //res.setHeader('Cache-Control', 'public')
                    res.setHeader('Cache-Control', cache_parm ? `max-age=${cache_parm}` : 'no-cache')
                    res.setHeader('Content-Type', 'text/css')
                    //res.writeHead(200, {'Content-Type': 'text/css'})
                    res.end(data)
                }
            })
        }
    }
}

const server = http.createServer()
server.on('request', httpHandler)
const PORT = 5000
const HOST = 'localhost'
server.listen(PORT, HOST, () => {
    console.log(`server started on ${HOST}:${PORT}`)
})