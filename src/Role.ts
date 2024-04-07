import { type ObjectId } from 'mongodb'
import { connectToDb } from 'serverless-mongodb-utils'

export enum AuthRole {
  SuperAdmin = 'SUPER_ADMIN',
  Admin = 'ADMIN',
  User = 'USER'
}

export interface IRole {
  _id: ObjectId
  name: AuthRole
}

export const rolesCollection = 'roles'

async function createRoleCollection (): Promise<void> {
  try {
    const database = await connectToDb()

    // Create a collection
    const options = {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['_id', 'name'],
          properties: {
            _id: {
              bsonType: 'objectId'
            },
            name: {
              enum: Object.values(AuthRole),
              bsonType: 'string'
            }
          }
        }
      }
    }
    await database.createCollection<IRole>(rolesCollection, options)
  } catch (error) {
    console.error(`Error in creating Appraisal Card : ${String(error)}`)
  }
}

export default createRoleCollection
