const fs = require('fs/promises')
const { gzip } = require('zlib')

exports.checkFileExist = async (file) => {
   try {
      await fs.access(file)
      return true
   } catch (error) {
      return false
   }
}


exports.compress = (data) =>
   new Promise((resolve, reject) => {
      gzip(data, (err, buf) => {
         if (err) reject(err)
         resolve(buf)
      })
   })