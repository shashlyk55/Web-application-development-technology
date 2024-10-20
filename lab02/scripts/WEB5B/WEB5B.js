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
                response.writeHead(500, {'Content-Type': 'text/text'})
                response.end('Server error')
            } else {
                response.writeHead(200, {'Content-Type': 'text/html'})
                response.end(text)
            }
        })
    } else if(pathname === '/api' && request.method === 'POST'){
        const maxLength = 10, minLength = 5
        let n = parseInt(request.headers['x-rand-n'])

        let arrSize = Math.floor(Math.random() * (maxLength - minLength)) + minLength
        let randArr = []

        for(let i = 0; i < arrSize; i++){
            randArr.push(Math.floor(Math.random() * (n - (-n))) + (-n))
        }
        
        let jsonArr = JSON.stringify(randArr)

        response.writeHead(200, {'Content-Type':'application/json'})
        response.end(jsonArr)
    }
})

const PORT = 5000
server.listen(PORT, () => {
    console.log(`Server strated on localhost:${PORT}`)
})