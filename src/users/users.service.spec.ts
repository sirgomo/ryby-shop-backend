import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Kunde } from 'src/entity/kundeEntity';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from 'src/dto/register.dto';
import { UserUpdateDto } from 'src/dto/userUpdate.dto';

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

      const createdUser: Kunde = await service.createUser(reguser);

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
      const createdUser: Kunde = await service.createUser(reguser);

      expect(createdUser.email).toEqual(user.email);
      expect(createdUser).toBeInstanceOf(Kunde);
    });
  });
  describe('getUserDetails', () => {
    it('should return user details', async () => {
      const userId = 1;
      const userDetails: Kunde = {
        id: userId,
        vorname: 'John Doe',
        nachname: '',
        password: '',
        adresse: new AdresseKunde(),
        lieferadresse: new Lieferadresse(),
        bestellungen: [],
        ruckgabe: [],
        email: '',
        telefon: '',
        role: '',
        registrierungsdatum: undefined,
        treuepunkte: 0,
        bewertungen: [],
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(userDetails);

      const result = await service.getUserDetails(userId);

      expect(result).toEqual(userDetails);
      expect(result.password).toBe('');
    });

    it('should return error if user details not found', async () => {
      const userId = 1;

      jest
        .spyOn(repo, 'findOne')
        .mockRejectedValue(new Error('User Details nicht gefunden'));

      const result = await service.getUserDetails(userId);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('User Details nicht gefunden');
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const itemId = 1;
      const itemToUpdate: UserUpdateDto = {
        id: itemId,
        vorname: 'Jan',
        nachname: 'Kowalski',
        email: 'jan.kowalski@example.com',
        telefon: '123456789',
        role: 'user',
        registrierungsdatum: undefined,
        treuepunkte: 100,
        l_strasse: 'Główna',
        l_hausnummer: '1',
        l_stadt: 'Warszawa',
        l_postleitzahl: '00-001',
        l_land: 'Polen',
        adresseStrasse: 'Mieszka I',
        adresseHausnummer: '1',
        adresseStadt: 'Kraków',
        adressePostleitzahl: '30-001',
        adresseLand: 'Polen',
      };

      jest
        .spyOn(repo, 'update')
        .mockResolvedValue({ affected: 1, raw: '', generatedMaps: [] });

      const result = await service.updateUser(itemToUpdate);

      expect(result).toBe(1);
    });

    it('should return error if update failed', async () => {
      const itemId = 1;
      const itemToUpdate: UserUpdateDto = {
        id: itemId,
        vorname: 'Jan',
        nachname: 'Kowalski',
        email: 'jan.kowalski@example.com',
        telefon: '123456789',
        role: 'user',
        registrierungsdatum: undefined,
        treuepunkte: 100,
        l_strasse: 'Główna',
        l_hausnummer: '1',
        l_stadt: 'Warszawa',
        l_postleitzahl: '00-001',
        l_land: 'Polen',
        adresseStrasse: 'Mieszka I',
        adresseHausnummer: '1',
        adresseStadt: 'Kraków',
        adressePostleitzahl: '30-001',
        adresseLand: 'Polen',
      };
      jest.spyOn(repo, 'update').mockRejectedValue(new Error('Update failed'));

      const result = await service.updateUser(itemToUpdate);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Update failed');
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const itemId = 1;
      const item = {
        userid: itemId,
        altPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const user: Kunde = {
        id: itemId,
        password: 'oldPasswordHash',
        vorname: 'sdklhsadj',
        nachname: 'asdjkljasd',
        adresse: new AdresseKunde(),
        lieferadresse: new Lieferadresse(),
        bestellungen: [],
        ruckgabe: [],
        email: '',
        telefon: '',
        role: '',
        registrierungsdatum: undefined,
        treuepunkte: 0,
        bewertungen: [],
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(repo, 'update')
        .mockResolvedValue({ affected: 1, raw: '', generatedMaps: [] });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('newPassword'));

      const result = await service.changePassword(item);

      expect(result).toBe(1);
    });

    it('should return error if password does not match', async () => {
      const itemId = 1;
      const item = {
        userid: itemId,
        altPassword: 'wrongPassword',
        newPassword: 'newPassword',
      };
      const user: Kunde = {
        id: itemId,
        password: 'oldPasswordHash',
        vorname: '',
        nachname: '',
        adresse: new AdresseKunde(),
        lieferadresse: new Lieferadresse(),
        bestellungen: [],
        ruckgabe: [],
        email: '',
        telefon: '',
        role: '',
        registrierungsdatum: undefined,
        treuepunkte: 0,
        bewertungen: [],
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.changePassword(item)).resolves.toThrowError(
        'Das falsche Passwort wurde eingegeben.',
      );
      //  await expect(service.changePassword(item))
    });

    it('should return error if change password failed', async () => {
      const itemId = 1;
      const item = {
        userid: itemId,
        altPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const user: Kunde = {
        id: itemId,
        password: 'oldPasswordHash',
        vorname: '',
        nachname: '',
        adresse: new AdresseKunde(),
        lieferadresse: new Lieferadresse(),
        bestellungen: [],
        ruckgabe: [],
        email: '',
        telefon: '',
        role: '',
        registrierungsdatum: undefined,
        treuepunkte: 0,
        bewertungen: [],
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(repo, 'update')
        .mockRejectedValue(new Error('Change password failed'));
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.changePassword(item);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Change password failed');
    });
  });
});
