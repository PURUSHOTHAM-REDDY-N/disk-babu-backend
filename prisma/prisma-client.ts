// import { PrismaClient } from '@prisma/client';

// // add prisma to the NodeJS global type
// // TODO : downgraded @types/node to 15.14.1 to avoid error on NodeJS.Global
// interface CustomNodeJsGlobal extends NodeJS.Global {
//   prisma: PrismaClient;
// }

// // Prevent multiple instances of Prisma Client in development
// declare const global: CustomNodeJsGlobal;

// const prisma = global.prisma || new PrismaClient();

// if (process.env.NODE_ENV === 'development') {
//   global.prisma = prisma;
// }

// export default prisma;

import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export default prisma;