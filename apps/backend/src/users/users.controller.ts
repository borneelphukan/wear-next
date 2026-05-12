import { Body, Controller, Post, Delete, Param, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Get('find/by-email')
  @HttpCode(HttpStatus.OK)
  getByEmail(@Query('email') email: string) {
    return this.usersService.getProfileByEmail(email);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(+id);
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@Param('id') id: string, @Body() body: any) {
    return this.usersService.deleteUser(+id, body.password);
  }

  @Post(':id/preferences')
  @HttpCode(HttpStatus.OK)
  updatePreferences(@Param('id') id: string, @Body() prefs: any) {
    return this.usersService.updatePreferences(+id, prefs);
  }

  @Post(':id/profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(@Param('id') id: string, @Body() updates: any) {
    return this.usersService.updateProfile(+id, updates);
  }
}
