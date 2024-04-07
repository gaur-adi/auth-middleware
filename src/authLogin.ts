import { type ObjectId } from 'mongodb'
import { connectToDb } from 'serverless-mongodb-utils'

export interface IAuthLogin {
  _id: ObjectId
  email: string
  password: string
  sessionToken: string[]
  userId: ObjectId
}

export const authLoginsCollection = 'authLogins'

export const createAuthLoginCollection = async (): Promise<void> => {
  try {
    const database = await connectToDb()

    // Create a collection
    const options = {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['_id', 'email', 'password', 'sessionToken', 'userId'],
          properties: {
            _id: {
              bsonType: 'objectId'
            },
            email: {
              bsonType: 'string'
            },
            password: {
              bsonType: 'string'
            },
            sessionToken: {
              bsonType: 'array',
              items: {
                bsonType: 'string'
              }
            },
            userId: {
              bsonType: 'objectId'
            }
          }
        }
      }
    }
    const collection = await database.createCollection<IAuthLogin>(authLoginsCollection, options)

    // Create unique index
    await collection.createIndex({ email: 1 }, { unique: true })
  } catch (error) {
    console.error(`Error in creating Appraisal Card : ${String(error)}`)
  }
}
