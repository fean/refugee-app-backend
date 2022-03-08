import * as mongoose from 'mongoose'
import Environment from '../env'

let connection: typeof mongoose | null = null

export const connect = async (): Promise<void> => {
  if (!connection) {
    connection = await mongoose.connect(Environment.connectionString)
  }
}

export const disconnect = async (): Promise<void> => {
  if (connection) {
    await connection.disconnect()
    connection = null
  }
}
