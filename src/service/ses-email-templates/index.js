const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdirAsync = promisify(fs.readdir)
const existsAsync = promisify(fs.exists)
const readFileAsync = promisify(fs.readFile)

const configHandler = async (serverless, options) => {
  const templateFolderPath = path.join(process.cwd(), 'ses-email-templates')
  const files = await readdirAsync(templateFolderPath)

  const templates = files
    .filter((fileName) => !fileName.endsWith('.txt') && fileName !== 'index.js')
    .map(async (fileName) => {
      const templateName = fileName.substring(0, fileName.lastIndexOf('.'))

      const result = {
        name: templateName,
        subject: await readFileAsync(path.join(templateFolderPath, `${templateName}.txt`), 'utf8'),
        html: await readFileAsync(path.join(templateFolderPath, fileName), 'utf8'),
      }

      const textTemplateFileName = `${templateName}.txt`
      if (await existsAsync(textTemplateFileName)) {
        Object.assign(result, {
          text: await readFileAsync(path.join(templateFolderPath, textTemplateFileName), 'utf8'),
        })
      }

      return result
    })

  return Promise.all(templates)
}

module.exports = configHandler
