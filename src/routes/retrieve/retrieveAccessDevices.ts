import { FastifyPluginAsync } from "fastify";
import { verifyAccessToken } from "../../utils/jsonwebtoken/verifyAccessToken";

interface LoginObject {
  accessToken: string;
}

const func: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/accessDevices", async function (request, reply) {
    try {
      const loginInfo = <LoginObject>request.query;
      console.log(`login info`, loginInfo);
      const users = this.mongo.db?.collection("users");
      const access = this.mongo.db?.collection("access");
      if (!users) {
        throw new Error("Failed to connect to users collection");
      }

      if (!access) {
        throw new Error("Failed to connect to devices collection");
      }

      // Verify access token
      const tokenInfo = verifyAccessToken(loginInfo.accessToken);
      if (!tokenInfo) {
        throw new Error("Invalid access token");
      }

      // Get user by private ID
      const user = await users?.findOne({ privateId: tokenInfo.privateId });
      if (!user) {
        throw new Error("User not found");
      }

      // Get device by recipientId
      const devices = await access
        ?.find({ recipientId: user.publicId })
        .toArray();
      if (!devices) {
        throw new Error("No Devices Found");
      }

      return { devices };
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
