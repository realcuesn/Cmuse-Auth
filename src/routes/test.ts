import { FastifyPluginAsync } from 'fastify'

interface Query {
    code: string,
    token: string,
    email: string,
    password: string
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/test', async function (request, reply) {
        const query = <Query>request.query
        const code = query.code;
        return { root: code }
    })
}

export default root;
