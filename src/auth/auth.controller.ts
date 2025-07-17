import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() body: { full_name: string; email: string; password: string; role: string }) {
    return this.authService['usersService'].createUser(
      body.full_name,
      body.email,
      body.password,
      body.role
    );
  }
}
