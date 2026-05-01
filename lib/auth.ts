import NextAuth, { NextAuthConfig } from "next-auth"
import { createUser, getUser, getDb } from "./db"

async function findOrCreateUserByName(name: string, avatarUrl: string | null) {
  const db = await getDb();
  let existing = await db.get('SELECT * FROM users WHERE name = ?', name);
  if (!existing) {
    await db.run('INSERT INTO users (id, name, points, avatar_url) VALUES (?, ?, 0, ?)', name, name, avatarUrl);
    existing = await db.get('SELECT * FROM users WHERE name = ?', name);
  } else if (avatarUrl && existing.avatar_url !== avatarUrl) {
    await db.run('UPDATE users SET avatar_url = ? WHERE name = ?', avatarUrl, name);
  }
  return existing;
}

export const authOptions: NextAuthConfig = {
  providers: [
    {
      id: "kick",
      name: "Kick",
      type: "oauth",
      clientId: process.env.KICK_CLIENT_ID,
      clientSecret: process.env.KICK_CLIENT_SECRET,
      authorization: {
        url: "https://id.kick.com/oauth/authorize",
        params: { scope: "user:read" }
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      token: "https://id.kick.com/oauth/token",
      userinfo: "https://api.kick.com/public/v1/users",
      profile(profile) {
        const user = profile.data && profile.data.length > 0 ? profile.data[0] : profile;
        const username = user.name || user.username || "unknown";
        return {
          id: username,
          name: username,
          image: user.profile_picture || user.profile_pic,
        }
      },
      checks: ["pkce", "state"],
    }
  ],
  callbacks: {
    async signIn({ user }) {
      // NextAuth overrides profile.id with a random UUID, so we MUST use the name
      const name = user.name;
      const avatarUrl = user.image || null;
      if (name) {
        try {
          await findOrCreateUserByName(name, avatarUrl);
          console.log(`[AUTH] User "${name}" signed in - matched/created by name`);
        } catch (e) {
          console.error("DB Save Error:", e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // Override token.sub with the username so session.user.id is always the name
      if (user?.name) {
        token.sub = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // token.sub is now the username (set in jwt callback above)
        session.user.id = token.sub as string;
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
  debug: false,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
