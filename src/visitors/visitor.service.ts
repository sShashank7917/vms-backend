import { Inject, Injectable } from '@nestjs/common';
import { CreateVisitorDto } from './create-visitor.dto';
import * as oracledb from 'oracledb';

@Injectable()
export class VisitorService {
  constructor(@Inject('ORACLE_POOL') private pool: oracledb.Pool) {}

  async register(dto: CreateVisitorDto) {
    const conn = await this.pool.getConnection();
    try {
      const checkSql = `
        SELECT visitor_id FROM visitors_master
        WHERE phone = :phone AND id_proof_number = :id_proof_number
      `;
      const checkResult = await conn.execute(checkSql, {
        phone: dto.phone,
        id_proof_number: dto.id_proof_number,
      });

      let visitor_id: number;

      if (checkResult.rows?.length > 0) {
        visitor_id = checkResult.rows[0][0];
      } else {
        const insertMasterSql = `
          INSERT INTO visitors_master
          (full_name, phone, email, nationality, company, id_proof_type, id_proof_number)
          VALUES (:full_name, :phone, :email, :nationality, :company, :id_proof_type, :id_proof_number)
          RETURNING visitor_id INTO :visitor_id
        `;

        const binds = {
          full_name: dto.full_name,
          phone: dto.phone,
          email: dto.email,
          nationality: dto.nationality,
          company: dto.company,
          id_proof_type: dto.id_proof_type,
          id_proof_number: dto.id_proof_number,
          visitor_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        };

        const res = await conn.execute(insertMasterSql, binds);
        visitor_id = res.outBinds.visitor_id[0];
      }

      const insertLogSql = `
        INSERT INTO visits_log
        (visitor_id, purpose, host, category, vehicle_details, asset_details)
        VALUES (:visitor_id, :purpose, :host, :category, :vehicle_details, :asset_details)
      `;
      await conn.execute(insertLogSql, {
        visitor_id,
        purpose: dto.purpose,
        host: dto.host,
        category: dto.category,
        vehicle_details: dto.vehicle_details,
        asset_details: dto.asset_details,
      }, { autoCommit: true });

      return { message: 'Visitor visit logged successfully' };
    } finally {
      await conn.close();
    }
  }

  async list() {
  const conn = await this.pool.getConnection();
  try {
    const result = await conn.execute(
      `SELECT 
         vm.visitor_id,
         vm.full_name, 
         vm.phone, 
         vm.email,
         vm.nationality,
         vm.company,
         vm.id_proof_type,
         vm.id_proof_number,
         vl.purpose, 
         vl.host, 
         vl.category,
         vl.vehicle_details,
         vl.asset_details,
         vl.check_in_time
       FROM visits_log vl
       JOIN visitors_master vm ON vl.visitor_id = vm.visitor_id
       ORDER BY vl.check_in_time DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }  // 👈 this returns array of objects
    );

    return result.rows;
  } finally {
    await conn.close();
  }
}
}
