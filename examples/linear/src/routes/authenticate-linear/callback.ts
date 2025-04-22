import type { Context } from "hono"
import { getCookie } from "hono/cookie"
import { access } from "node:fs/promises"
import db from "../../util/db"

export default async function handler(c: Context) {
  // get userId from cookies to continue
  const userId = getCookie(c, "userId")

  const accessTokenRequest: Record<string, string> = {
    client_id: process.env.LINEAR_CLIENT_ID as string,
    client_secret: process.env.LINEAR_CLIENT_SECRET as string,
    redirect_uri: "http://localhost:6100/authenticate-linear/callback",
    code: c.req.query("code") as string,
    grant_type: "authorization_code",
  }

  const accessToken = await fetch("https://api.linear.app/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(accessTokenRequest),
  }).then((response) => response.json())

  const _res = await db.from("users").update({ accessToken: accessToken.access_token, refreshToken: accessTokenRequest.code }).eq("id", userId)

  return c.redirect("http://localhost:3000/me")
}
