import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  IsNumber,
} from 'class-validator';

export class CreateVisitorDto {
  @IsOptional()
  @IsNumber()
  visitor_id?: number;

  // These fields are required only when visitor_id is not present
  @ValidateIf(o => !o.visitor_id)
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ValidateIf(o => !o.visitor_id)
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  id_proof_type?: string;

  @IsString()
  @IsOptional()
  id_proof_number?: string;

  @IsString()
  @IsOptional()
  vehicle_details?: string;

  @IsString()
  @IsOptional()
  asset_details?: string;
}
