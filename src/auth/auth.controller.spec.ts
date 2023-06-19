import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from 'src/dto/register.dto';
import { JwtStrategy } from './auth.JwtStrategy.strategy';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UsersService;
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService, JwtStrategy],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', () => {
      const loginSpy = jest.spyOn(authService, 'login');
      const user = { email: 'test@example.com', password: 'password123' };

      controller.login(user);

      expect(loginSpy).toHaveBeenCalledWith(user);
    });

    it('should return the result of authService.login', () => {
      const result: Promise<{ access_token: string }> = new Promise(
        (resolve, reject) => {
          resolve({ access_token: 'abc123' });
        },
      );
      jest.spyOn(authService, 'login').mockReturnValue(result);
      const user = { email: 'test@example.com', password: 'password123' };

      expect(controller.login(user)).toBe(result);
    });
  });

  describe('registerNewUser', () => {
    it('should call userService.createUser with correct parameters', () => {
      const createUserSpy = jest.spyOn(userService, 'createUser');
      const user: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        nachname: 'Test',
        vorname: 'User',
        telefon: '123456789',
        adresseHausnummer: '1',
        adresseLand: 'Germany',
        adressePostleitzahl: '12345',
        adresseStadt: 'Berlin',
        adresseStrasse: 'Teststraße',
        l_hausnummer: '2',
        l_land: 'Germany',
        l_postleitzahl: '54321',
        l_stadt: 'Hamburg',
        l_strasse: 'Lieferstraße',
        role: '',
        registrierungsdatum: undefined,
        treuepunkte: 0,
      };

      controller.registerNewUser(user);

      expect(createUserSpy).toHaveBeenCalledWith(user);
    });

    it('should return the result of userService.createUser', () => {
      const result = Promise.resolve({
        id: 1,
        name: 'John Doe',
        email: 'test@example.com',
      });
      jest.spyOn(userService, 'createUser').mockReturnValue(result);
      const user: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        nachname: 'Test',
        vorname: 'User',
        telefon: '123456789',
        adresseHausnummer: '1',
        adresseLand: 'Germany',
        adressePostleitzahl: '12345',
        adresseStadt: 'Berlin',
        adresseStrasse: 'Teststraße',
        l_hausnummer: '2',
        l_land: 'Germany',
        l_postleitzahl: '54321',
        l_stadt: 'Hamburg',
        l_strasse: 'Lieferstraße',
        role: '',
        registrierungsdatum: undefined,
        treuepunkte: 0,
      };

      expect(controller.registerNewUser(user)).toBe(result);
    });
  });
});
