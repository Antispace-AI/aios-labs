export default async function handler(c) {
  return c.text(`Hello, ${process.env.NAME}`)
}
