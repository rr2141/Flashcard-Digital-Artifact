//initalising the client 
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


//prisma queries 
async function main() {
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

  module.exports = prisma;