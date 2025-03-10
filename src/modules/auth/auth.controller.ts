import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto, RegisterAuthDto } from './auth.dto';
import { VerifyAction } from 'src/enums/auth';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.handleLogin(loginAuthDto);
  }

  @HttpCode(200)
  @Post('signup')
  signup(@Body() signupAuthDto: RegisterAuthDto) {
    return this.authService.handleSignup(signupAuthDto);
  }

  @Post('verify/:token')
  @ApiParam({
    name: 'token',
  })
  @ApiQuery({
    name: 'action',
    enum: VerifyAction,
  })
  verify(
    @Param('token') token: string,
    @Query('action', new ParseEnumPipe(VerifyAction))
    action: VerifyAction,
  ) {
    return this.authService.handleVerify(token, action);
  }
}
