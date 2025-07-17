import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVisitorDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  nationality: string;

  @IsString()
  @IsOptional()
  company: string;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  id_proof_type: string;

  @IsString()
  @IsOptional()
  id_proof_number: string;

  @IsString()
  @IsOptional()
  vehicle_details: string;

  @IsString()
  @IsOptional()
  asset_details: string;
}
