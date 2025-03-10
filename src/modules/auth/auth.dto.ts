import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({
    minLength: 6,
    maxLength: 100,
  })
  @IsEmail()
  @Length(6, 100)
  email: string;

  @ApiProperty({
    minLength: 6,
    maxLength: 30,
  })
  @IsString()
  @Length(6, 30)
  password: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  firstname: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  lastname: string;
}

export class LoginAuthDto {
  @ApiProperty({
    minLength: 6,
    maxLength: 100,
  })
  @IsEmail()
  @Length(6, 100)
  email: string;

  @ApiProperty({
    minLength: 6,
    maxLength: 30,
  })
  @IsString()
  @Length(6, 30)
  password: string;
}

export class UserDto {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  create_at?: Date;
  update_at?: Date;
}

export class AuthResponseDto {
  access: string;
  refresh: string;
  user: UserDto;
}
