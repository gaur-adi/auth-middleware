import jwt, { type JwtPayload } from 'jsonwebtoken'

const secretKey = process.env.JWT_SECRET_KEY ?? ''

const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, secretKey) as JwtPayload
  return decoded
}

const generateSessionToken = (userId: string): string => {
  const token = jwt.sign({ userId }, secretKey, { expiresIn: '12h' })
  return token
}

export { generateSessionToken, verifyToken }
