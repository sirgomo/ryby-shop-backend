import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Kunde } from 'src/entity/kundeEntity';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from 'src/dto/register.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<Kunde>;
  let addressRepo: Repository<AdresseKunde>;
  let laddRepo: Repository<Lieferadresse>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<Kunde>>(getRepositoryToken(Kunde));
    addressRepo = module.get<Repository<AdresseKunde>>(
      getRepositoryToken(AdresseKunde),
    );
    laddRepo = module.get<Repository<Lieferadresse>>(
      getRepositoryToken(Lieferadresse),
    );
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const reguser: RegisterUserDto = {
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
        role: 'USER',
        registrierungsdatum: new Date(Date.now()),
        treuepunkte: 0,
      };

      const user = new Kunde();
      user.email = reguser.email;
      user.password = await bcrypt.hash(reguser.password, 10);
      user.nachname = reguser.nachname;
      user.vorname = reguser.vorname;
      user.registrierungsdatum = reguser.registrierungsdatum;
      user.role = 'USER';
      user.telefon = reguser.telefon;
      user.treuepunkte = 0;

      const address = new AdresseKunde();
      address.hausnummer = reguser.adresseHausnummer;
      address.land = reguser.adresseLand;
      address.postleitzahl = reguser.adressePostleitzahl;
      address.stadt = reguser.adresseStadt;
      address.strasse = reguser.adresseStrasse;
      user.adresse = address;

      const laddres = new Lieferadresse();
      laddres.hausnummer = reguser.l_hausnummer;
      laddres.land = reguser.l_land;
      laddres.postleitzahl = reguser.l_postleitzahl;
      laddres.stadt = reguser.l_stadt;
      laddres.strasse = reguser.l_strasse;
      user.lieferadresse = laddres;

      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[user], 1]);
      jest.spyOn(repo, 'save').mockResolvedValue(user);

      const createdUser = await service.createUser(reguser);
      user.password = createdUser.password;

      expect(createdUser.email).toEqual(reguser.email);
    });

    it('should create a new admin user if there are no existing users', async () => {
      const reguser: RegisterUserDto = {
        email: 'admin@example.com',
        password: 'password123',
        nachname: 'Admin',
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
        registrierungsdatum: new Date(Date.now()),
        treuepunkte: 0,
      };

      const user = new Kunde();
      user.email = reguser.email;
      user.password = await bcrypt.hash(reguser.password, 10);
      user.nachname = reguser.nachname;
      user.vorname = reguser.vorname;
      user.registrierungsdatum = reguser.registrierungsdatum;
      user.role = 'ADMIN';
      user.telefon = reguser.telefon;
      user.treuepunkte = 0;

      const address = new AdresseKunde();
      address.hausnummer = reguser.adresseHausnummer;
      address.land = reguser.adresseLand;
      address.postleitzahl = reguser.adressePostleitzahl;
      address.stadt = reguser.adresseStadt;
      address.strasse = reguser.adresseStrasse;
      user.adresse = address;

      const laddres = new Lieferadresse();
      laddres.hausnummer = reguser.l_hausnummer;
      laddres.land = reguser.l_land;
      laddres.postleitzahl = reguser.l_postleitzahl;
      laddres.stadt = reguser.l_stadt;
      laddres.strasse = reguser.l_strasse;
      user.lieferadresse = laddres;

      jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0]);
      jest.spyOn(repo, 'save').mockResolvedValue(user);
      const createdUser = await service.createUser(reguser);

      expect(createdUser.email).toEqual(user.email);
    });
  });
});
