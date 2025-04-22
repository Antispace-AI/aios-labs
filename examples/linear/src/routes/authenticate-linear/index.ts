import type { Context } from "hono"
import { setCookie } from "hono/cookie"

export default async function handler(c: Context) {
  // save userId to cookies befoure redirecting
  const userId = c.req.query("userId")
  setCookie(c, "userId", userId as string)

  return c.redirect(`https://linear.app/oauth/authorize?client_id=${process.env.LINEAR_CLIENT_ID}&redirect_uri=${encodeURIComponent("http://localhost:6100/authenticate-linear/callback")}&response_type=code&scope=read,write`)
}
