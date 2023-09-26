# Next.js X NestJS x Supabase Guide

This guide should help you set up Next.js and NestJS projects within a monorepo as well as integrate them with Supabase. Follow these steps to streamline your development process.
[dev.to source](https://dev.to/abhikbanerjee99/next-x-nest-connecting-your-nextjs-app-to-a-nestjs-backend-419c)

---

## Table of Contents

1. Setting up Supabase
2. Setting up Next.js Project
3. Setting up NestJS Project

---

## 1. Setting up Supabase

### Register and Create a New Project

1. Go to supabase.com and sign up if you haven't already.
2. Create a new project in the organization of your choice.
3. Once the project is created, you will see the Supabase Dashboard.

### Initialize Next Auth Schema

1. In the left panel, click on **SQL Editor**.
2. Navigate to the **Quickstarts** tab.
3. Click on **Next Auth Schema Setup**.
4. SQL statements will appear in the SQL Editor. Click **Run** to execute them.
5. You should now have a schema named `next_auth`.

### Make Schema Public

1. Navigate to **Settings**.
2. Click on **API**.
3. Scroll down to **API Settings** and add `next_auth` in **Extra Search Path**.
4. Click **Save** to apply the changes.

---

## 2. Setting up Next.js Project

### Next.js Initialization

1. Run `npx create-next-app@latest` to initialize your Next.js project.
2. Follow the prompts and let's name our project **client** for this guide.

### Additional Steps

- Integration with Next Auth and Supabase will be covered in subsequent sections.

---

## 3. Setting up NestJS Project

### Install NestJS CLI

1. Install NestJS CLI globally using `npm i -g @nestjs/cli`.

### NestJS Initialization

1. In the parent folder of **client**, run `nest new server`.
2. Remove the `node_modules` directories from both projects.

### Configure package.json and main.ts

1. In the `package.json` of the **server** project, rename the script `start:dev` to `dev`.
2. In the `main.ts` file of your NestJS project, change the PORT from the default 3000 to 3001.

---

## 4. Creating a Monorepo with Turborepo

### Initialize Package.json

1. In the folder containing **client** and **server**, run `pnpm init` to create a new `package.json` file.

### Set Up Turbo Dependencies and Workspaces

1. Create a folder named **apps**.
2. Move the **client** and **server** folders into the **apps** folder.
3. Update your `package.json` to look similar to the following example:

```json
{
  "name": "your-jira",
  "version": "1.0.0",
  "workspaces": ["apps/*"],
  "devDependencies": {
    "eslint": "^8.47.0",
    "prettier": "^3.0.2",
    "tsconfig": "*",
    "turbo": "latest"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  }
}
```

### Create Turbo Script

1. Create a **turbo.json** file in the root directory.
2. The file should contain build, lint, and dev instructions, as shown below:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Final Steps

1. Optionally, add a **.gitignore** file to your root directory.
2. Run **pnpm i** to install global dependencies.
3. Execute **pnpm run dev** to start the development servers for both client and server.

## 5. Adding Next Auth and Supabase to Next.js

### Add Environment Variables to Next.js

1. Navigate to the root of your Next.js project located inside the **apps** folder. The path would be something like `apps/client`.
2. Create a new TypeScript file called `additional-env.d.ts`.

   ```bash
   touch additional-env.d.ts
   ```

3. Add the TypeScript declarations for your environment variables:

   ```typescript
   declare global {
     namespace NodeJS {
       interface ProcessEnv {
         NODE_ENV: 'development' | 'production';
         NEXTAUTH_SECRET: string;
         APP_JWT_SECRET: string;
         NEXTAUTH_URL: string;
         GOOGLE_CLIENT_ID: string;
         GOOGLE_CLIENT_SECRET: string;
         NEXT_PUBLIC_SUPABASE_URL: string;
         SUPABASE_SERVICE_ROLE_KEY: string;
       }
     }
   }
   export {};
   ```

4. Update the `tsconfig.json` in your Next.js project to include `additional-env.d.ts`. Add the file name to the `include` array.

   ```json
   {
     "include": ["next-env.d.ts", "additional-env.d.ts", "**/*.ts", "**/*.tsx"]
   }
   ```

5. Create a `.env` file in the Next.js root directory to store your environment variables. The file should match the keys specified in `additional-env.d.ts`.

   ```bash
   touch .env
   ```

### Retrieve Supabase API Credentials

1. Go back to your Supabase Dashboard and navigate to the **Settings** -> **API**.
2. Here, you'll find your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Copy these values to your `.env` file.

## 6. Google Client Credentials

For using Google Sign-in, you'll need Google API keys. These keys are used by the GoogleProvider of Next Auth.

1. Navigate to the **Credentials** section of **"API & Services"**.
2. Click on **Create Credentials**, and then select **"OAuth client ID"**.

   ![GCP API & Services console\](your-image-link-here)

3. In the next screen, select **"Application Type"** as **"Web Application"**. This will prompt you for a name for the App. For instance, you can name it "Your Jira".

   ![GCP OAuth Options\](your-image-link-here)

4. Fill in the **"Authorized Javascript Origins"** and **"Authorized redirect URIs"** fields. These will represent the locations where OAuth requests can originate and where the user will be redirected after choosing a Google account to sign in with.

5. Clicking on **Create** will give you the OAuth Client IDs and the **GOOGLE_CLIENT_SECRET**.

   ![GCP OAuth Client Secret Section\](your-image-link-here)

6. The **GOOGLE_CLIENT_ID** is generated right after OAuth client creation.

## 7. Integrating Next Auth

Finally, let's integrate Next Auth into our Next.js app.

1. Inside your frontend repository, create a new folder structure: `api/auth/\[...nextauth\]`. Inside `\[...nextauth\]`, create a `route.ts` file.

   ![INext Auth directory structure\](your-image-link-here)

   ```typescript
   import { signJwt } from '@/app/_lib/jwt';
   import { SupabaseAdapter } from '@auth/supabase-adapter';
   import { Adapter } from 'next-auth/adapters';
   import NextAuth from 'next-auth/next';
   import GoogleProvider from 'next-auth/providers/google';
   const handler = NextAuth({
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         authorization: {
           params: {
             prompt: 'consent',
             access_type: 'offline',
             response_type: 'code',
           },
         },
       }),
     ],
     session: {
       strategy: 'jwt',
     },
     adapter: SupabaseAdapter({
       url: process.env.NEXT_PUBLIC_SUPABASE_URL,
       secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
     }) as Adapter,
     callbacks: {
       async jwt({ token, account }) {
         if (account) {
           token.auth_token = await signJwt({
             sub: token.sub,
             id_token: account.id_token,
             access_token: account.access_token,
             expires_at: account.expires_at,
           });
         }
         return token;
       },
       async session({ session, token }) {
         session.auth_token = token.auth_token as string;
         return session;
       },
     },
   });
   export { handler as GET, handler as POST };
   ```

   ```bash
   pnpm install @auth/supabase-adapter
   ```

2. Callbacks are crucial for managing sessions and custom JWTs.

   ```typescript
    callbacks: {
       async jwt({ token, account }) {
         if (account) {
           token.auth_token = await signJwt({
             sub: token.sub,
             id_token: account.id_token,
             access_token: account.access_token,
             expires_at: account.expires_at,
           });
         }
         return token;
       },
       async session({ session, token }) {
         session.auth_token = token.auth_token as string;
         return session;
       },
     },
   ```

3. For JWT handling, create a separate folder called `jwt` inside the `_lib` folder.

   ```typescript
   import jwt from 'jsonwebtoken';
   export const signJwt = async (payload: any, expiresIn = '1d') => {
     const token = await jwt.sign(payload, process.env.APP_JWT_SECRET, {
       algorithm: 'HS512',
       expiresIn,
     });
     return token;
   };
   export const verifyJwt = (token: string) => {
     const data = jwt.verify(token, process.env.APP_JWT_SECRET, {
       algorithms: ['HS512'],
     });
     return data;
   };
   ```

4. Finally, create a `types/next-auth.d.ts` file.

   ```typescript
   import NextAuth from 'next-auth';

   declare module 'next-auth' {
     interface Session extends Session {
       auth_token: string;
     }
   }
   ```
