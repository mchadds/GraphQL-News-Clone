// imports
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    // encrypt users password
    const password = await bcrypt.hash(args.password, 10)
    // store new user in db
    const user = await context.prisma.user.create({ data: { ...args, password } })
    // generate JSON web token
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    // return AuthPayload object
    return {
        token,
        user,
    }
}
  
async function login(parent, args, context, info) {
    // retrieve user
    const user = await context.prisma.user.findUnique({ where: { email: args.email } })
    if (!user) {
        throw new Error('No such user found')
    }
    // compare typed in password to user password from db
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    // return AuthPayload object
    return {
        token,
        user,
    }
}

async function post(parent, args, context, info) {
    const userId = getUserId(context)
    const newLink = await context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
          postedBy: { connect: { id: userId } },
        }
      })
      context.pubsub.publish("NEW_LINK", newLink)
    
      return newLink
}

async function vote(parent, args, context, info) {
    // validate incoming JWT 
    const userId = getUserId(context)
  
    // Check if vote already exists
    const vote = await context.prisma.vote.findUnique({
      where: {
        linkId_userId: {
          linkId: Number(args.linkId),
          userId: userId
        }
      }
    })
    // vote does already exist
    if (Boolean(vote)) {
      throw new Error(`Already voted for link: ${args.linkId}`)
    }
  
    // vote does not yet exist - create the vote
    const newVote = context.prisma.vote.create({
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: Number(args.linkId) } },
      }
    })
    context.pubsub.publish("NEW_VOTE", newVote)
  
    return newVote
  }
  
module.exports = {
    signup,
    login,
    post,
    vote,
}