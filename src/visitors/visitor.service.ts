import { Inject, Injectable } from '@nestjs/common';
import { CreateVisitorDto } from './create-visitor.dto';
import * as oracledb from 'oracledb';
import axios from 'axios';
import * as FormData from 'form-data';
import { ConfigService } from '@nestjs/config';
import { FaceApiResponse } from './face-api-response.interface';


@Injectable()
export class VisitorService {
  constructor(
    @Inject('ORACLE_POOL') private readonly pool: oracledb.Pool,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateVisitorDto, file: Express.Multer.File) {
    const conn = await this.pool.getConnection();
    try {
      let visitor_id = await this.findOrCreateVisitor(conn, dto);

      await this.logVisit(conn, visitor_id, dto);

      // Call Python face-recognition service
      const faceResult = await this.sendFaceToPython(visitor_id, file);

      return {
        message: 'Visitor visit logged successfully',
        visitor_id,
        face: faceResult,
      };
    } finally {
      await conn.close();
    }
  }

  private async findOrCreateVisitor(conn: oracledb.Connection, dto: CreateVisitorDto): Promise<number> {
    const checkSql = `
      SELECT visitor_id FROM visitors_master
      WHERE phone = :phone AND id_proof_number = :id_proof_number
    `;
    const checkResult = await conn.execute(checkSql, {
      phone: dto.phone,
      id_proof_number: dto.id_proof_number,
    });

    if (checkResult.rows?.length > 0) {
      return checkResult.rows[0][0];
    }

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
    return res.outBinds.visitor_id[0];
  }

  private async logVisit(conn: oracledb.Connection, visitor_id: number, dto: CreateVisitorDto) {
    const insertLogSql = `
      INSERT INTO visits_log
      (visitor_id, purpose, host, category, vehicle_details, asset_details)
      VALUES (:visitor_id, :purpose, :host, :category, :vehicle_details, :asset_details)
    `;
    await conn.execute(
      insertLogSql,
      {
        visitor_id,
        purpose: dto.purpose,
        host: dto.host,
        category: dto.category,
        vehicle_details: dto.vehicle_details,
        asset_details: dto.asset_details,
      },
      { autoCommit: true },
    );
  }

  private async sendFaceToPython(visitor_id: number, file: Express.Multer.File): Promise<FaceApiResponse> {
    const formData = new FormData();
    formData.append('visitor_id', visitor_id.toString());
    formData.append('file', file.buffer, file.originalname);

    const fastapiUrl =
      this.configService.get<string>('FACE_API_URL') ||
      'http://localhost:8000/upload/';

    const res = await axios.post<FaceApiResponse>(fastapiUrl, formData, {
      headers: formData.getHeaders(),
    });

    if (res.data.status !== 'success') {
      console.error('Face recognition error:', res.data.message);
      throw new Error(res.data.message || 'Face recognition failed');
    }

    return res.data;
  }

  async list() {
    const conn = await this.pool.getConnection();
    try {
      const result = await conn.execute(
        `
        SELECT 
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
        ORDER BY vl.check_in_time DESC
        `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      return result.rows;
    } finally {
      await conn.close();
    }
  }
}
