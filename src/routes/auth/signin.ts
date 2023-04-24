import { FastifyPluginAsync } from "fastify";
import { comparePasswords } from "../../utils/tools/comparePasswords";

interface SigninObject {
  email: string;
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

const login: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/signin", async function (request, reply) {
    try {
      const signinInfo = <SigninObject>request.query;
      console.log(`signin email`, signinInfo);
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
      // Find the user with the given email
      const user = await users.findOne({ email: signinInfo.email });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check if the password is correct
      const isCorrectPassword = await comparePasswords(
        signinInfo.password,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Invalid email or password");
      }

      const device: Device = {
        uid: signinInfo.deviceUid,
        ownerId: user.publicId,
        deviceCpu: signinInfo.deviceCpu,
        deviceGpu: signinInfo.deviceGpu,
        osDistro: signinInfo.osDistro,
        osPlatform: signinInfo.osPlatform,
        osVersion: signinInfo.osVersion,
        osHostName: signinInfo.osHostName,
        deviceMemory: signinInfo.deviceMemory,
        region: signinInfo.region,
        location: {
          type: "Point",
          coordinates: [parseFloat(signinInfo.lat), parseFloat(signinInfo.lon)],
        },
        deviceSettings: null,
        deviceStatus: false,
      };

      const deviceAccess: DeviceAccess = {
        uid: signinInfo.deviceUid,
        ownerId: user.publicId,
        deviceCpu: signinInfo.deviceCpu,
        deviceGpu: signinInfo.deviceGpu,
        osDistro: signinInfo.osDistro,
        osPlatform: signinInfo.osPlatform,
        osVersion: signinInfo.osVersion,
        osHostName: signinInfo.osHostName,
        deviceMemory: signinInfo.deviceMemory,
        region: signinInfo.region,
        location: {
          type: "Point",
          coordinates: [parseFloat(signinInfo.lat), parseFloat(signinInfo.lon)],
        },
        deviceSettings: null,
        deviceStatus: false,
        recipientId: user.publicId,
        accessType: "owner",
      };

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

export default login;
