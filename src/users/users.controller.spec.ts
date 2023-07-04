import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserUpdateDto } from 'src/dto/userUpdate.dto';
import { NewPassword } from 'src/dto/newPassword.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Kunde } from 'src/entity/kundeEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { Repository } from 'typeorm';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('getUserDetails', () => {
    it('should return user details', async () => {
      const userId = 1;
      const userDetails = {};

      jest.spyOn(service, 'getUserDetails').mockResolvedValue(userDetails);

      const result = await controller.getUserDetails(userId);

      expect(result).toBe(userDetails);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const userUpdateDto: UserUpdateDto = {
        id: 1,
        vorname: '',
        nachname: '',
        email: '',
        telefon: '',
        adresse: new AdresseKunde(),
        lieferadresse: new Lieferadresse(),
      }; // provide sample user update data

      jest.spyOn(service, 'updateUser').mockResolvedValue(1);

      const result = await controller.updateUser(userUpdateDto);

      expect(result).toBe(1);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const newPasswordDto: NewPassword = {
        userid: 1,
        altPassword: 'kapa',
        newPassword: 'slata',
      }; // provide sample new password data

      jest.spyOn(service, 'changePassword').mockResolvedValue(1);

      const result = await controller.changePassword(newPasswordDto);

      expect(result).toBe(1);
    });
  });
});
