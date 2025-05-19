import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Role } from "../enum/role.enum";

export class PayloadRequestDto {
  @IsNotEmpty({ message: 'Required id' })
  id: string

  @IsNotEmpty({ message: 'Required email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsEnum(Role, { message: 'Required role' })
  role: Role

  @IsOptional()
  iat?: number;

  @IsOptional()
  exp?: number;
}