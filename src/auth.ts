import { type NextFunction, type Request, type Response } from 'express'
import * as httpContext from 'express-http-context'
import { Role } from './Role'
import * as jwtUtils from './utils/jwtUtils'
import { findOneOrFail } from 'serverless-mongodb-utils'
import { authLoginsCollection, type IAuthLogin } from './authLogin'

const authMiddleware = (req: Request, res: Response, next: NextFunction, userCollection: string, userInterface: any): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    next()
  } else {
    checkAccess(token, res, next, userCollection, userInterface)
  }
}

const adminAccess = (req: Request, res: Response, next: NextFunction, userCollection: string, userInterface: any): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    send401(res)
  } else {
    checkAccess(token, res, next, userCollection, userInterface, [Role.SuperAdmin, Role.Admin])
  }
}

const send401 = (res: Response): void => {
  res.clearCookie('sessionToken')
  res.clearCookie('authenticated')
  res.status(401).send({
    message: 'Unauthorized Access',
    success: false,
    status: 401
  })
}

const checkAccess = (
  token: any,
  res: Response,
  next: NextFunction,
  userCollection: string,
  userInterface: any,
  roles?: string[]
): void => {
  try {
    jwtUtils.verifyToken(token)
    void findOneOrFail<IAuthLogin>(authLoginsCollection, { sessionToken: token })
      .then(userLogin => {
        void findOneOrFail<typeof userInterface>(userCollection, { email: userLogin.email })
          .then(user => {
            httpContext.set('userLogin', userLogin)
            if (roles === undefined) {
              next()
            } else if (roles.includes(user.role.name)) {
              next()
            } else {
              throw new Error('Unauthorized Access')
            }
          })
      }).catch(next)
  } catch (err: any) {
    console.error(err.message ?? 'error occured during authentication')
    send401(res)
  }
}

const superAdminAccess = (req: Request, res: Response, next: NextFunction, userCollection: string, userInterface: any): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    send401(res)
  } else {
    checkAccess(token, res, next, userCollection, userInterface, [Role.SuperAdmin])
  }
}

const userAccess = (req: Request, res: Response, next: NextFunction, userCollection: string, userInterface: any): void => {
  const token = req.cookies.sessionToken
  if (token == null) {
    send401(res)
  } else {
    checkAccess(token, res, next, userCollection, userInterface, [Role.SuperAdmin, Role.Admin, Role.User])
  }
}

const getUserLogin = (context: string): any => {
  return httpContext.get(context)
}

export { adminAccess, authMiddleware, getUserLogin, superAdminAccess, userAccess }
