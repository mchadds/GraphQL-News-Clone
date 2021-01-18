// import
const { PrismaClient } = require("@prisma/client")

// instantiate 
const prisma = new PrismaClient()

// function for sending queries to the DB
async function main() {
  const newLink = await prisma.link.create({
      data: {
          description: 'GraphQL News',
          url: 'www.graphqlnews.com',
      }
  })
  const allLinks = await prisma.link.findMany()
  console.log(allLinks)
}

main()
  .catch(e => {
    throw e
  })
  // cose DB connection
  .finally(async () => {
    await prisma.$disconnect()
  })