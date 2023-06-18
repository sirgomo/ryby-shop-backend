import { env } from 'env/env';
import { createConnection, Connection } from 'mysql2/promise';
export class Database {
  async checkDatabaseConnection(): Promise<Connection> {
    try {
      const connection = await createConnection({
        host: env.host,
        user: env.user,
        password: env.pass,
        database: env.db,
      });
      console.log('Database ok');
      return connection;
    } catch (error) {
      console.error('Błąd połączenia z bazą danych:', error);
      console.log('Tworzenie bazy danych...');
      const connection = await createConnection({
        host: env.host,
        user: env.user,
        password: env.pass,
        multipleStatements: true,
      });
      await connection
        .query(
          `CREATE DATABASE IF NOT EXISTS ${env.db};
        
        `,
        )
        .catch((err) => {
          console.log(err);
        });

      console.log('Utworzono bazę danych');
      return connection;
    }
  }
}
