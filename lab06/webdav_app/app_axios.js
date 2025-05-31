import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import user_data from './user.js';
import { parseStringPromise } from 'xml2js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://app.koofr.net/dav';
const USERNAME = user_data.email;
const PASSWORD = user_data.password;

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`,
    },
});

// async function listFiles(directory = '/') {
//     try {
//         const files = await client.getDirectoryContents(directory);
//         console.log('list:', files);
//     } catch (err) {
//         console.error(':', err.message);
//     }
// }

// async function listFiles(directory = '/') {
//     try {
//         const response = await client.request({
//             url: `/Koofr/${directory}`,
//             method: 'PROPFIND',
//             headers: {
//                 Depth: '1',
//             },
//         });
//         if (response.status >= 200 && response.status < 300) {
//                  const parsedData = await parseStringPromise(response.data);
//                 const items = parsedData['D:multistatus']['D:response'].map(item => {
//                 const href = item['D:href'][0];
//                 const name = path.basename(href);
//                 const isDirectory = item['D:propstat'][0]['D:prop'][0]['D:resourcetype'] && item['D:propstat'][0]['D:prop'][0]['D:resourcetype'][0]['D:collection'] !== undefined;
//                 return { name, isDirectory };
//                 });
//                 console.log('list:', items);
//             //console.log('list:', response.data);
//         } else {
//             console.error(`getting list error: status ${response.status}`);
//         }
//     } catch (err) {
//         console.error('getting list error:', err.message);
//     }
// }

// Создание директории

async function createDirectory(dirName) {
    try {
        await client.request({
            url: `/Koofr/${dirName}`,
            method: 'MKCOL',
        });
        console.log(`dir '/Koofr/${dirName}' created`);

    } catch (err) {
        console.error(`error dir create: status ${err.message}`);
    }
}

// Загрузка файла на сервер
async function uploadFile(localFilePath, remoteFilePath) {
    try {
        const fileStream = fs.createReadStream(path.join(__dirname, 'static', localFilePath));
        const response = await client.put(`/Koofr/${remoteFilePath}`, fileStream, {
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });
        console.log(`file '/Koofr/${remoteFilePath}' created`);

    } catch (err) {
        console.error('error file create:', err.message);
    }
}

// Скачивание файла с сервера
async function downloadFile(remoteFilePath, localFilePath) {
    try {
        const response = await client.get(`/Koofr/${remoteFilePath}`, {
            responseType: 'stream',
        });
        const localPath = path.join(__dirname, 'static', localFilePath);
        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);
        console.log(`file downloaded to: ${localPath}`);

    } catch (err) {
        console.error('error file download:', err.message);
        return
    }
}

// Копирование файла
async function copyFile(filePath, copyFilePath) {
    try {
        await client.request({
            url: `/Koofr/${filePath}`,
            method: 'COPY',
            headers: {
                Destination: `${BASE_URL}/Koofr/${copyFilePath}`,
            },
        });
        console.log(`file cpied to: ${copyFilePath}`);

    } catch (err) {
        console.error(`error file coping: ${err.message}`);
    }
}

// Удаление файла или папки
async function deleteFileOrDirectory(filePath) {
    try {
        await client.delete(`/Koofr/${filePath}`);
        console.log(`file or dir '/Koofr/${filePath}' deleted`);

    } catch (err) {
        console.error(`delete error: ${err.message}`);
    }
}

(async () => {
    await createDirectory('aaa')
    //await createDirectory('b')

    //await uploadFile('text.txt', 'b/data.txt');
    //await copyFile('b/data.txt', 'a/data.txt')

    //await deleteFileOrDirectory('b/data.txt')
    //await deleteFileOrDirectory('a')

    //await downloadFile('a/data.txt', 'qrwtye.txt')
})();
