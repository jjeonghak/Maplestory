import { IsEmail, IsNotEmpty } from "class-validator";

export class SigninRequestDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Required password' })
  password: string;
}