const fs = require('fs/promises')

exports.checkFileExist = async (file) => {
   try {
      await fs.access(file)
      return true
   } catch (error) {
      return false
   }
}
