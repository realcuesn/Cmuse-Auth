import fp from "fastify-plugin";
import mongodb, { FastifyMongodbOptions } from "@fastify/mongodb";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<FastifyMongodbOptions>(async (fastify) => {
  fastify.register(mongodb, {
    forceClose: true,
    url: "mongodb://127.0.0.1:27017/cmuse",
  });
});

/* export default fp<FastifyMongodbOptions>(async (fastify) => {
  fastify.register(mongodb, {
    forceClose: true,
    url: process.env.URI,
  });
});
 */
