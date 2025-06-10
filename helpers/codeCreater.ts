import { randomInt } from "crypto";
import { PrismaClient } from "@prisma/client";

const characters = "QWERTYUIOPASDFGHJKLZXCVBNM0987654321";
const codeCreator = async (
  length: number,
  client: PrismaClient,
  model: keyof PrismaClient,
  fieldName: string
) => {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    let code: string = "";

    for (let i = 0; i < length; i++) {
      code += characters[randomInt(0, characters.length)];
    }

    if (
      !(await (client[model] as any).findUnique({
        where: {
          [fieldName]: code,
        },
      }))
    ) {
      return code;
    }

    attempts++;
  }
  throw new Error("failed to generate the code after mutliple attempts");
};

export default codeCreator;
