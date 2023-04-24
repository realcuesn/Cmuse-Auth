import { FastifyPluginAsync } from "fastify";

interface QueryCode {
  publicId: string;
  username: string;
}

interface UserDocument {
  publicId: string;
  username: string;
  avatar?: string;
  createdAt?: Date;
}

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/userFriend", async function (request, reply) {
    try {
      const query = <QueryCode>request.query;
      const users = this.mongo.db?.collection("users");
      if (!users) {
        throw new Error("Failed to connect to users collection");
      }

      // Get user by private ID
      const user = await users?.findOne({ publicId: query.publicId });
      if (!user) {
        throw new Error("User not found");
      }
      const userDoc: UserDocument = {
        publicId: user?.publicId,
        username: user?.username,
        avatar: user?.avatar,
        createdAt: user?.createdAt,
      };

      return { userDoc };
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        reply.code(400);
        return { error: error.message };
      }
    }
  });
};

export default example;
