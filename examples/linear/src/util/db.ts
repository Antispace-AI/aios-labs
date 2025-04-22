import { createClient } from "@supabase/supabase-js"

const db = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string)

export default db
