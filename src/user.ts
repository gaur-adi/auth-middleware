import { type ObjectId } from 'mongodb'
import { connectToDb } from 'serverless-mongodb-utils'
import { type IRole } from './Role'

export interface IAuthUser {
  _id: ObjectId
  firstName: string
  lastName: string
  email: string
  employeeId: string
  role: IRole
  phoneNumber: string
}

export const usersCollection = 'users'

export const createUserCollection = async (): Promise<void> => {
  try {
    const database = await connectToDb()

    // Create a collection
    const options = {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['_id', 'firstName', 'lastName', 'email', 'employeeId'],
          properties: {
            _id: {
              bsonType: 'objectId'
            },
            firstName: {
              bsonType: 'string'
            },
            lastName: {
              bsonType: 'string'
            },
            email: {
              bsonType: 'string'
            },
            employeeId: {
              bsonType: 'string'
            },
            phoneNumber: {
              bsonType: 'string'
            },
            role: {
              bsonType: 'object'
            }
          }
        }
      }
    }
    const collection = await database.createCollection<IAuthUser>(usersCollection, options)

    // Create unique indexes
    await collection.createIndex({ email: 1 }, { unique: true })
    await collection.createIndex({ employeeId: 1 }, { unique: true })
  } catch (error) {
    console.error(`Error in creating Appraisal Card : ${String(error)}`)
  }
}
