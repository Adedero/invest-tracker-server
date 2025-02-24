import { hash } from 'argon2'
export const hashPassword = async (value: string) => {
  const h = await hash(value)
  return h
}
