const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const server = http.createServer((request, response) => {

    const parsedUrl = url.parse(request.url, true)
    const pathname = parsedUrl.pathname

    if(pathname === '/'){
        fs.readFile(path.join(__dirname, './index.html'), (err, text) => {
            if(err){
                response.writeHead(500, {'Content-Type':'text/text'})
                response.end('Server error')
            } else {
                response.writeHead(200, {'Content-Type':'text/html'})
                response.end(text)
            }
        })
    } else if(pathname === '/api' && request.method === 'POST') {
        // при отправке запроса клиента регистр пользовательских заголовков становится нижним
        let x = parseInt(request.headers['x-value-x'])
        let y = parseInt(request.headers['x-value-y'])
        let z = x + y
        
        response.writeHead(200, {
            'Content-Type':'text/plain',
            'x-value-z': z
        })
        response.end()
    }


})

const PORT = 5000
server.listen(PORT, () => {
    console.log(`Server started on localhost:${PORT}`)
})


