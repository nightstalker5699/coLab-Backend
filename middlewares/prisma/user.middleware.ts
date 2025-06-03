import { PrismaClient } from "@prisma/client";
import { UserWithoutPassowrd } from "../../types/userTypes";

const model = new PrismaClient().$extends({
  query: {
    user: {
      async $allOperations({ model, operation, args, query }) {
        const selectArgs = args as any;
        if (selectArgs.omit?.password === false) {
          return query(selectArgs);
        }
        selectArgs.omit = { password: true };
        return query(selectArgs);
      },
    },
  },
});

export default model.user;
