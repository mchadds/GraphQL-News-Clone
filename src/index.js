const { ApolloServer } = require('apollo-server');
const { PrismaClient } = require('@prisma/client')

// implemenation of GraphQL schema
const resolvers = {
  Query: {
    info: () => `This is the API of a GraphQL News`,
    feed: async (parent, args, context) => {
        return context.prisma.link.findMany()
    },
  },
  Mutation: {
// create new link object and add to list of links - finally return new link
    post: (parent, args, context) => {
        const newLink = context.prisma.link.create({
        data: {
            url: args.url,
            description: args.description,
            },
        })
        return newLink
    },
  },
}

const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient()
// bundle schema and resolverss
const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: {
    prisma,
  }
})

server
  .listen()
  .then(({ url }) =>
    console.log(`Server is running on ${url}`)
  );