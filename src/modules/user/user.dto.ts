import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class ResponseUser {
  constructor(public user: User) {}
}

export class CreateUserDto {
  lastname: string;
  firstname: string;
  email: string;
  password: string;
}

export class UploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any;
}
