import { createClient } from 'webdav';
import user_data from './user.js';
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const koofrUrl = 'https://app.koofr.net/dav'

const username = user_data.email
const password = user_data.password

const client = createClient(koofrUrl, { username, password })

console.log(client);

const staticDir = path.join(__dirname, '/static')

async function listFiles(directory = '/') {
    try {
        const files = await client.getDirectoryContents(directory);
        console.log('Список файлов и папок:', files);
    } catch (err) {
        console.error('Ошибка при получении списка файлов:', err.message);
    }
}

async function createDirectory(dirName){
    try{
        await client.createDirectory(`/Koofr/${dirName}`)
        console.log('Directory create succesfully');
    } catch (err){
        console.error(`Create dir error: ${err.message}`)
    }
}

async function uploadFile(fileName, remoteFilePath) {
    try {
        const fileStream = fs.createReadStream(`./static/${fileName}`);
        await client.putFileContents(`/Koofr/${remoteFilePath}`, fileStream, { overwrite: true });
        console.log(`Файл успешно загружен: /Koofr/${remoteFilePath}`);
    } catch (err) {
        console.error('Ошибка при загрузке файла:', err.message);
    }
}

async function downloadFile(remoteFilePath, newFileName) {
    try {
        const fileContents = await client.getFileContents(`/Koofr/${remoteFilePath}`, { format: 'binary' });
        fs.writeFileSync(`./static/${newFileName}`, fileContents);
        console.log(`Файл успешно скачан`);
    } catch (err) {
        console.error('Ошибка при скачивании файла:', err.message);
    }
}

async function copyFile(filePath, copyFilePath) {
    try{
        await client.copyFile(`/Koofr/${filePath}`, `/Koofr/${copyFilePath}`)
    } catch (err){
        console.error(`Copy file error: ${err}`)
    }
}

async function deleteFileOrDirectory(filePath){
    try {
        await client.deleteFile(`/Koofr/${filePath}`)
        console.log('file deleted');
    } catch(err) {
        console.error(`Delete file error: ${err}`)
    }
}

// Пример использования функций
(async () => {
    //await createDirectory('qwe')
    //await createDirectory('a')

    //await uploadFile('text.txt', 'qwe/data.txt');
    //await copyFile('a/data.txt', 'qwe/data.txt')

    //await deleteFileOrDirectory('a')
    //await downloadFile('qwe/data.txt', '123.txt')

    //console.log('Список файлов в корневой папке:');
    //await listFiles('/Koofr');
})();
