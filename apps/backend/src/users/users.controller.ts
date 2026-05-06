import { Body, Controller, Post, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: any) {
    return this.usersService.login(body.email, body.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @Delete(':email')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@Param('email') email: string) {
    return this.usersService.deleteUser(email);
  }
}
