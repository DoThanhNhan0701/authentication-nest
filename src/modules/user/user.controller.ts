import {
  Body,
  Controller,
  Get,
  Headers,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import generateKey from 'src/helper/generateKey';
import { UploadDto } from './user.dto';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getMe(@Headers() headers) {
    return this.userService.getMe(headers.authorization as string);
  }

  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (_, __, callback) => {
          mkdirSync('./public/images/', { recursive: true });
          return callback(null, './public/images/');
        },
        filename: (_, file, callback) => {
          const ext = extname(file.originalname);
          const fileName = `${Date.now()}-${generateKey(10)}${ext}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  uploadAvatar(
    @Headers() headers,
    @Body() body: UploadDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image',
        })
        .build(),
    )
    avatar: Express.Multer.File,
  ) {
    return this.userService.handleUpload(
      headers.authorization as string,
      avatar,
    );
  }
}
