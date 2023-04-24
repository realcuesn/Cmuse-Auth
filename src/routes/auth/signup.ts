import { FastifyPluginAsync } from "fastify";
import { generateTimestampBasedUUID } from "../../utils/tools/generateTimestampBasedUUID";
import { createAccessToken } from "../../utils/jsonwebtoken/createAccessToken";
import { hashPassword } from "../../utils/tools/hashUserPassword";

interface SignupObject {
  email: string;
  username: string;
  password: string;
  osDistro: string;
  osPlatform: string;
  osVersion: string;
  osHostName: string;
  deviceGpu: string;
  deviceCpu: string;
  deviceMemory: number;
  deviceUid: string;
  region: string;
  lat: string;
  lon: string;
}

interface Device {
  uid: string;
  ownerId: string;
  osHostName: string;
  osVersion: string;
  osPlatform: string;
  deviceMemory: number;
  deviceCpu: string;
  deviceGpu: string;
  osDistro: string;
  region: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  deviceStatus: boolean;
  deviceSettings: any;
}

interface DeviceAccess {
  uid: string;
  ownerId: string;
  osHostName: string;
  osVersion: string;
  osPlatform: string;
  deviceMemory: number;
  deviceCpu: string;
  deviceGpu: string;
  osDistro: string;
  region: string;
  accessType: string;
  recipientId: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  deviceStatus: boolean;
  deviceSettings: any;
}

interface User {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  isVerified: boolean;
  publicId: string;
  privateId: string;
  token: Token;
  avatar: string | null;
  friends: FriendItem[];
  blockedUsers: BlockedUser[];
  friendRequests: FriendRequest[];
}

interface Token {
  accessToken: string;
  version: number;
  createdAt: Date;
}

interface FriendItem {
  id: string;
  username: string;
}

interface BlockedUser {
  blocked: string;
  createdAt: Date;
}

interface FriendRequest {
  from: string;
  createdAt: Date;
}

const signup: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/signup", async function (request, reply) {
    try {
      const signupInfo = <SignupObject>request.query;
      console.log(`signup email`, signupInfo);
      const users = this.mongo.db?.collection("users");
      const devices = this.mongo.db?.collection("devices");
      const access = this.mongo.db?.collection("access");
      if (!users) {
        throw new Error("Failed to connect to users collection");
      }

      if (!devices) {
        throw new Error("Failed to connect to devices collection");
      }

      if (!access) {
        throw new Error("Failed to connect to access collection");
      }

      // Check if the email or username is already in the database
      const existingUser = await users?.findOne({
        $or: [{ email: signupInfo.email }, { username: signupInfo.username }],
      });
      if (existingUser) {
        throw new Error("Email or username already exists");
      }

      const publicId = generateTimestampBasedUUID("public");
      const privateId = generateTimestampBasedUUID("private");
      const createdAt = new Date();
      const hashedPassword = await hashPassword(signupInfo.password);
      const user: User = {
        username: signupInfo.username,
        email: signupInfo.email,
        password: hashedPassword,
        createdAt,
        isVerified: false,
        publicId,
        privateId,
        token: {
          accessToken: createAccessToken(privateId, 1),
          version: 1,
          createdAt,
        },
        avatar: null,
        friends: [],
        friendRequests: [],
        blockedUsers: [],
      };
      console.log(user);

      const device: Device = {
        uid: signupInfo.deviceUid,
        ownerId: publicId,
        deviceCpu: signupInfo.deviceCpu,
        deviceGpu: signupInfo.deviceGpu,
        osDistro: signupInfo.osDistro,
        osPlatform: signupInfo.osPlatform,
        osVersion: signupInfo.osVersion,
        osHostName: signupInfo.osHostName,
        deviceMemory: signupInfo.deviceMemory,
        region: signupInfo.region,
        location: {
          type: "Point",
          coordinates: [parseFloat(signupInfo.lat), parseFloat(signupInfo.lon)],
        },
        deviceSettings: null,
        deviceStatus: false,
      };

      const deviceAccess: DeviceAccess = {
        uid: signupInfo.deviceUid,
        ownerId: signupInfo.deviceUid,
        deviceCpu: signupInfo.deviceCpu,
        deviceGpu: signupInfo.deviceGpu,
        osDistro: signupInfo.osDistro,
        osPlatform: signupInfo.osPlatform,
        osVersion: signupInfo.osVersion,
        osHostName: signupInfo.osHostName,
        deviceMemory: signupInfo.deviceMemory,
        region: signupInfo.region,
        location: {
          type: "Point",
          coordinates: [parseFloat(signupInfo.lat), parseFloat(signupInfo.lon)],
        },
        deviceSettings: null,
        deviceStatus: false,
        recipientId: publicId,
        accessType: "owner",
      };

      const userResult = await users?.insertOne(user);
      if (!userResult?.insertedId) {
        throw new Error("Failed to insert user into database");
      }

      const deviceResult = await devices?.insertOne(device);
      if (!deviceResult.insertedId) {
        throw new Error("Failed to insert device into database");
      }

      const accessResult = await access?.insertOne(deviceAccess);
      if (!accessResult.insertedId) {
        throw new Error("Failed to insert deviceAccess into database");
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

export default signup;
