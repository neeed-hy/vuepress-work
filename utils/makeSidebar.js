// 用来自动生成侧边栏

const path = require('path');
const fs = require('fs');

function removeConfig (fileArray) {
    let index1 = fileArray.indexOf('.vuepress')
    if (index1 > -1) {
        fileArray.splice(index1, 1)
    }
    let index2 = fileArray.indexOf('README.md')
    if (index2 > -1) {
        fileArray.splice(index2, 1)
    }
    let index3 = fileArray.indexOf('.DS_Store')
    if (index3 > -1) {
        fileArray.splice(index3, 1)
    }
}

function make (dirName, fileNames) {
    const key = '/' + dirName + '/'
    fileNames.unshift('')
    const result = {}
    result[key] = fileNames
    return result
}

function makeSidebar () {
    const result = {}
    let dirNames = fs.readdirSync('./docs')
    removeConfig(dirNames)
    for (const dirName of dirNames) {
        const tempPath = path.join('./docs', dirName)
        const fileNames = fs.readdirSync(tempPath)
        removeConfig(fileNames)
        const tempObject = make(dirName, fileNames)
        Object.assign(result, tempObject)
    }
    return result
}

module.exports = {
    makeSidebar
};