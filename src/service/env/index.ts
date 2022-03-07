class Environment {
  public static get connectionString(): string {
    return process.env.CONN_STRING as string
  }
}

export default Environment
