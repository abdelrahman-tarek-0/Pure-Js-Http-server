const fs = require('fs/promises')

module.exports = (flag) => {
   const argv = process.argv

   for (let i = 0; i < argv.length; i++) {
      const arg = argv[i]

      if (arg === flag) {
         return argv?.[i + 1]
      }
   }
}
