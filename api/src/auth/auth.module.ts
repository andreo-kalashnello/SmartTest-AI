import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { PasswordService } from './password.service';
import { RolesGuard } from './roles.guard';
import { TokenService } from './token.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
    providers: [AuthService, PasswordService, TokenService, JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
    exports: [JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule {}
