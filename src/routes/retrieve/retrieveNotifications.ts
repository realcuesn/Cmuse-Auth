import { FastifyPluginAsync } from "fastify";
import { verifyAccessToken } from "../../utils/jsonwebtoken/verifyAccessToken";

interface LoginObject {
  accessToken: string;
}

const func: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/access-notifications", async function (request, reply) {
    try {
      const loginInfo = <LoginObject>request.query;
      console.log(`login info`, loginInfo);
      const notifications = this.mongo.db?.collection("notifications");
      if (!notifications) {
        throw new Error("Failed to connect to users collection");
      }
      // Verify access token
      const tokenInfo = verifyAccessToken(loginInfo.accessToken);
      if (!tokenInfo) {
        throw new Error("Invalid access token");
      }

      // Get user by private ID
      const user = await notifications?.findOne({
        privateId: tokenInfo.privateId as string,
      });
      if (!user) {
        throw new Error("User not found");
      } else {
        const notificationCol = await notifications
          ?.find({ to: user.publicId })
          .toArray();
        return { notificationCol };
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        reply.code(400);
        return { error: error.message };
      }
    }
  });
};

export default func;
