import { Controller, Get, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpUser } from '../decorators';
import { HttpGoogleOAuthGuard } from '../guards';
import { GoogleLoginUserDto } from './dto/google-login.dto';

@SetMetadata('google-login', true)
@UseGuards(HttpGoogleOAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  async googleAuth() {}

  @Get('google-redirect')
  googleAuthRedirect(@HttpUser() user: GoogleLoginUserDto) {
    return this.authService.googleLogin(user);
  }
}
