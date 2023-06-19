import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from 'src/dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Kunde } from 'src/entity/kundeEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { Repository } from 'typeorm';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let repo: Repository<Kunde>;
  let addressRepo: Repository<AdresseKunde>;
  let laddRepo: Repository<Lieferadresse>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(Kunde),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AdresseKunde),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Lieferadresse),
          useClass: Repository,
        },
        JwtService,
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    repo = moduleRef.get<Repository<Kunde>>(getRepositoryToken(Kunde));
    addressRepo = moduleRef.get<Repository<AdresseKunde>>(
      getRepositoryToken(AdresseKunde),
    );
    laddRepo = moduleRef.get<Repository<Lieferadresse>>(
      getRepositoryToken(Lieferadresse),
    );
  });

  describe('registerNewUser', () => {
    it('should create a new user and return it', async () => {
      const newUser: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        vorname: '',
        nachname: '',
        telefon: '',
        role: '',
        registrierungsdatum: undefined,
        treuepunkte: 0,
        l_strasse: '',
        l_hausnummer: '',
        l_stadt: '',
        l_postleitzahl: '',
        l_land: '',
        adresseStrasse: '',
        adresseHausnummer: '',
        adresseStadt: '',
        adressePostleitzahl: '',
        adresseLand: '',
      };

      jest.spyOn(usersService, 'createUser').mockResolvedValue(newUser);

      const result = await authController.registerNewUser(newUser);

      expect(result).toEqual(newUser);
    });
  });

  describe('login', () => {
    it('should return an access token if user is valid', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };

      const accessToken = 'sampleAccessToken';

      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ access_token: accessToken });

      const result = await authController.login(user);

      expect(result).toEqual({ access_token: accessToken });
    });

    it('should throw an error if user is invalid', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error('Unauthorized'));

      await expect(authController.login(user)).rejects.toThrowError(
        'Unauthorized',
      );
    });
  });
});
