import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Matches } from "class-validator";
import { Role } from "../enum/role.enum";

export class SignupRequestDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Required password' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,16}$/, {message: 'Invalid password format'})
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role
}