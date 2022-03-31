import * as mongoose from 'mongoose'
import Environment from '../env'

let connection: typeof mongoose | null = null

export const connect = async (): Promise<void> => {
  if (!connection) {
    connection = await mongoose.connect(Environment.connectionString, {
      connectTimeoutMS: 4000,
    })
  }
}

export const disconnect = async (timeout: number = 3000): Promise<void> => {
  if (connection) {
    await Promise.race([
      connection.disconnect(),
      new Promise((resolve) => setTimeout(resolve, timeout)),
    ])
    connection = null
  }
}
