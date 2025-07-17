import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as oracledb from 'oracledb';

@Injectable()
export class UsersService {
  constructor(@Inject('ORACLE_POOL') private pool: oracledb.Pool) {}

  async findByEmail(email: string) {
    const conn = await this.pool.getConnection();
    try {
      const res = await conn.execute(
        `SELECT user_id, full_name, email, password_hash, role FROM users_auth WHERE email = :email`,
        { email }
      );

      if (res.rows?.length) {
        const [user_id, full_name, email, password_hash, role] = res.rows[0];
        return { user_id, full_name, email, password_hash, role };
      }

      return null;
    } finally {
      await conn.close();
    }
  }

  async createUser(full_name: string, email: string, password: string, role: string) {
    const conn = await this.pool.getConnection();
    try {
      const password_hash = await bcrypt.hash(password, 10);

      await conn.execute(
        `
        INSERT INTO users_auth (full_name, email, password_hash, role)
        VALUES (:full_name, :email, :password_hash, :role)
        `,
        { full_name, email, password_hash, role },
        { autoCommit: true }
      );

      return { message: 'User created successfully' };
    } finally {
      await conn.close();
    }
  }
}
