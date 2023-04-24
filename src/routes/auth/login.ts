import { FastifyPluginAsync } from "fastify";
import { createAccessToken } from "../../utils/jsonwebtoken/createAccessToken";
import { verifyAccessToken } from "../../utils/jsonwebtoken/verifyAccessToken";

interface LoginObject {
  accessToken: string;
  deviceUid: string;
}

const login: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/login", async function (request, reply) {
    try {
      const loginInfo = <LoginObject>request.query;
      console.log(`login info`, loginInfo);
      const users = this.mongo.db?.collection("users");
      const devices = this.mongo.db?.collection("devices");
      if (!users) {
        throw new Error("Failed to connect to users collection");
      }

      if (!devices) {
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

      // Get device by UID
      const device = await devices?.findOne({ uid: loginInfo.deviceUid });
      if (!device) {
        throw new Error("Access denied: device not found");
      }

      // Check if device belongs to user
      if (device.ownerId !== user.publicId) {
        throw new Error("Access denied: device does not belong to user");
      }

      // Check if access token is valid for device
      if (user.token.accessToken !== loginInfo.accessToken) {
        // Invalidate old access token and generate new one
        user.token = {
          accessToken: createAccessToken(
            user.privateId,
            user.token.version + 1
          ),
          version: user.token.version + 1,
          createdAt: new Date(),
        };
        await users?.updateOne(
          { privateId: user.privateId },
          { $set: { token: user.token } }
        );
      }

      return { user, device };
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        reply.code(400);
        return { error: error.message };
      }
    }
  });
};

export default login;
