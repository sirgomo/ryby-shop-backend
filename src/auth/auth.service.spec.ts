import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Kunde } from 'src/entity/kundeEntity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user object if password matches', async () => {
      const user = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const tmp: Kunde = new Kunde();
      tmp.email = user.email;
      tmp.password = hashedPassword;
      jest
        .spyOn(usersService, 'findOne')
        .mockImplementation(() => Promise.resolve(tmp));

      const result = await service.validateUser(user.email, user.password);

      expect(result).toBeDefined();
      expect(result.email).toEqual(user.email);
      expect(result.password).toBeUndefined();
    });

    it('should return null if password does not match', async () => {
      const user = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash('wrongpassword', 10);
      const tmp: Kunde = new Kunde();
      tmp.email = user.email;
      tmp.password = hashedPassword;
      jest
        .spyOn(usersService, 'findOne')
        .mockImplementation(() => Promise.resolve(tmp));

      const result = await service.validateUser(user.email, user.password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token if user is validated', async () => {
      const user = { email: 'test@example.com', password: 'password123' };
      jest
        .spyOn(service, 'validateUser')
        .mockImplementation(() =>
          Promise.resolve({ email: user.email, id: 1 }),
        );
      jest.spyOn(jwtService, 'sign').mockImplementation(() => 'access_token');

      const result = await service.login(user);

      expect(result).toBeDefined();
      expect(result.access_token).toEqual('access_token');
    });

    it('should throw Unauthorized exception if user is not validated', async () => {
      const user = { email: 'test@example.com', password: 'password123' };
      jest
        .spyOn(service, 'validateUser')
        .mockImplementation(() => Promise.resolve(null));

      await expect(service.login(user)).rejects.toThrowError(HttpException);
      await expect(service.login(user)).rejects.toThrowError('Unauthorized');
    });
  });
});
