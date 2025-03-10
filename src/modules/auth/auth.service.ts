import {
  HttpStatus,
  Injectable,
  HttpException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto, AuthResponseDto, RegisterAuthDto } from './auth.dto';
import { UserService } from '../user/user.service';
import { ResponseMessage } from 'src/enums/responseMessages.enum';
import { AuthTokenType, VerifyAction } from 'src/enums/auth';
import { MailService } from '../mail/mail.service';
import { compare, hashSync } from 'bcrypt';
import { saltRound } from 'src/enums/jwt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async handleLogin(loginAuthDto: LoginAuthDto): Promise<AuthResponseDto> {
    const user = await this.getUserByEmail(loginAuthDto.email);

    this.validateUser(user, 'User not found');
    await this.verifyPassword(
      loginAuthDto.password,
      user.password,
      'Invalid password',
    );

    const [refresh, access] = await Promise.all([
      this.createRefresh(user.id),
      this.createAccess(user.id),
    ]);

    return {
      access,
      refresh,
      user: user,
    };
  }

  async handleSignup(data: RegisterAuthDto) {
    const user = await this.userService.getByEmail(data.email);

    if (user)
      throw new HttpException(
        ResponseMessage.EXISTED_EMAIL,
        HttpStatus.BAD_REQUEST,
      );

    const token = await this.jwtService.signAsync(
      { ...data, type: VerifyAction.SIGNUP },
      {
        expiresIn: '10h',
      },
    );

    await this.mailService.sendConfirm(data.email, encodeURIComponent(token));
    return {
      message: ResponseMessage.MAIL_WAS_SENT,
    };
  }

  async handleVerify(token: string, action: VerifyAction) {
    if (action === VerifyAction.SIGNUP) {
      try {
        const data = await this.jwtService.verifyAsync(token);
        if (data.type !== VerifyAction.SIGNUP)
          throw new HttpException(
            ResponseMessage.INVALID_ACTION,
            HttpStatus.BAD_REQUEST,
          );
        const user = await this.userService.getByEmail(data.email as string);
        if (user)
          throw new HttpException(
            ResponseMessage.VERIFIED,
            HttpStatus.BAD_REQUEST,
          );

        return this.userService.addUser({
          lastname: data.lastname,
          firstname: data.firstname,
          email: data.email,
          password: hashSync(data.password as string, saltRound),
        });
      } catch (error: any) {
        if (error.name === 'JsonWebTokenError')
          throw new HttpException(
            ResponseMessage.INVALID_TOKEN,
            HttpStatus.NOT_ACCEPTABLE,
          );
        if (
          error.message === ResponseMessage.VERIFIED ||
          error.message === ResponseMessage.INVALID_ACTION
        )
          throw error;
        throw new InternalServerErrorException();
      }
    }
  }

  private async getUserByEmail(email: string): Promise<User> {
    const user = await this.userService.getByEmail(email);
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);
    else return user;
  }

  private validateUser(user: User | undefined, errorMessage: string): void {
    if (!user) throw new NotFoundException(errorMessage);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
    errorMessage: string,
  ): Promise<void> {
    const isMatch = await compare(plainPassword, hashedPassword);
    if (!isMatch) {
      throw new NotFoundException(errorMessage);
    }
  }

  async createRefresh(id: string) {
    return this.jwtService.signAsync(
      { id, type: AuthTokenType.REFRESH },
      { expiresIn: 5 * 24 * 60 * 60 },
    );
  }

  async createAccess(id: string) {
    return this.jwtService.signAsync(
      { id, type: AuthTokenType.ACCESS },
      { expiresIn: 5 * 24 * 60 * 60 },
    );
  }
}
