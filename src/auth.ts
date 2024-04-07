import { type NextFunction, type Request, type Response } from 'express'
import * as httpContext from 'express-http-context'
import { AuthRole } from './Role'
import { verifyToken } from './utils/jwtUtils'
import { findOneOrFail } from 'serverless-mongodb-utils'
import { authLoginsCollection, type IAuthLogin } from './authLogin'
import { type IAuthUser, usersCollection } from './user'

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    next()
  } else {
    checkAccess(token, res, next)
  }
}

const adminAccess = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    send401(res)
  } else {
    checkAccess(token, res, next, [AuthRole.SuperAdmin, AuthRole.Admin])
  }
}

const send401 = (res: Response): void => {
  res.clearCookie('sessionToken')
  res.clearCookie('authenticated')
  res.status(401).send({
    message: 'UNAUTHORIZED_ACCESS',
    success: false,
    status: 401
  })
}

const checkAccess = (token: any, res: Response, next: NextFunction, roles?: string[]): void => {
  try {
    verifyToken(token)
    void findOneOrFail<IAuthLogin>(authLoginsCollection, { sessionToken: token })
      .then(userLogin => {
        void findOneOrFail<IAuthUser>(usersCollection, { email: userLogin.email })
          .then(user => {
            httpContext.set('userLogin', userLogin)
            if (roles === undefined) {
              next()
            } else if (roles.includes(user.role.name)) {
              next()
            } else {
              throw new Error('UNAUTHORIZED_ACCESS')
            }
          })
      }).catch(next)
  } catch (err: any) {
    console.error(err.message ?? 'error occured during authentication')
    send401(res)
  }
}

const superAdminAccess = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    send401(res)
  } else {
    checkAccess(token, res, next, [AuthRole.SuperAdmin])
  }
}

const userAccess = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    send401(res)
  } else {
    checkAccess(token, res, next, [AuthRole.SuperAdmin, AuthRole.Admin, AuthRole.User])
  }
}

const getUserLogin = (): IAuthLogin => {
  return httpContext.get('userLogin')
}

export { adminAccess, authMiddleware, getUserLogin, superAdminAccess, userAccess }
