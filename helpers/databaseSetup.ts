import { exec } from "child_process";

export default function setupDatabase() {
  // Prisma commands to set up the database
  exec("npx prisma db push", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Prisma db push: ${error.message}`);
    } else {
      console.log("Prisma db push executed successfully");
      //   console.log(stdout);
    }
  });
}
