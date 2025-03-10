import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, ResponseUser } from './user.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { File } from '../files/entities/file.entity';
import { FileType } from 'src/enums/files';
import { AccessData } from 'src/utils/types';
import { getBearerToken } from 'src/helper/getToken';

export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async getByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    return user;
  }

  async getMe(authorization: string): Promise<ResponseUser> {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const { id }: AccessData = await this.jwtService.verify(
      getBearerToken(authorization),
    );

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: id,
        },
        // relations: {
        //   avatarId: true,
        // },
      });

      if (!user) throw new NotFoundException();

      return new ResponseUser(user);
    } catch (error: any) {
      if (error.status === 404) throw error;
      throw new UnauthorizedException();
    }
  }

  async addUser(createUser: CreateUserDto) {
    const user = this.userRepository.create({
      last_name: createUser.lastname,
      first_name: createUser.firstname,
      email: createUser.email,
      password: createUser.password,
    });
    const res = await this.userRepository.save(user);
    return res;
  }

  async handleUpload(authorization: string, avatar: Express.Multer.File) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const { id }: AccessData = await this.jwtService.verify(
      getBearerToken(authorization),
    );

    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: {
        avatarId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const file = new File();

    file.cdn = avatar.path.replace('public', '');
    file.type = FileType.IMAGE;
    file.user = user;

    user.avatarId = file;

    await this.userRepository.save(user);

    return {
      avatar: 'http://localhost:3000' + user?.avatarId?.cdn,
    };
  }
}
