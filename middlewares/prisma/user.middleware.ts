import { PrismaClient } from "@prisma/client";
import { UserWithoutPassowrd } from "../../types/userTypes";

const model = new PrismaClient({
  datasourceUrl:
    process.env.NODE_ENV === "test"
      ? process.env.DATABASE_URL_TEST
      : process.env.DATABASE_URL_PRO,
}).$extends({
  query: {
    user: {
      async $allOperations({ model, operation, args, query }) {
        const selectArgs = args as any;
        if (selectArgs.omit?.password === false || operation == "count") {
          return query(selectArgs);
        }
        selectArgs.omit = { password: true };
        return query(selectArgs);
      },
    },
  },
});

export default model;
