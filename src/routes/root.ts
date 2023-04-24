import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const users = await this.mongo.db?.collection('devices').find({}).toArray()
    return { root: users }
  })
}

export default root;
