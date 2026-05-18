import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      title: string;
      department: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    title: string;
    department: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    title?: string;
    department?: string;
  }
}
