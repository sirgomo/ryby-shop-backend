import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from 'src/dto/register.dto';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Kunde } from 'src/entity/kundeEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserUpdateDto } from 'src/dto/userUpdate.dto';
import { NewPassword } from 'src/dto/newPassword.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Kunde) private readonly repo: Repository<Kunde>,
    @InjectRepository(AdresseKunde)
    private readonly addressRepo: Repository<AdresseKunde>,
    @InjectRepository(Lieferadresse)
    private readonly laddRepo: Repository<Lieferadresse>,
  ) {}
  async findOne(email: string) {
    return await this.repo.findOne({
      where: {
        email: email,
      },
    });
  }
  async createUser(reguser: RegisterUserDto): Promise<Kunde> {
    try {
      const userzahl = await this.repo.findAndCount().then((res) => res[1]);
      const user = new Kunde();
      user.email = reguser.email;
      user.password = await bcrypt.hash(reguser.password, 10);
      user.nachname = reguser.nachname;
      user.vorname = reguser.vorname;
      user.registrierungsdatum = reguser.registrierungsdatum;
      user.role = 'USER';
      if (userzahl === 0) {
        user.role = 'ADMIN';
      }
      user.telefon = reguser.telefon;
      user.treuepunkte = 0;
      const address = new AdresseKunde();
      address.hausnummer = reguser.adresseHausnummer;
      address.land = reguser.adresseLand;
      address.postleitzahl = reguser.adressePostleitzahl;
      address.stadt = reguser.adresseStadt;
      address.strasse = reguser.adresseStrasse;
      user.adresse = address;

      if (reguser.l_hausnummer !== 'null') {
        const laddres = new Lieferadresse();
        laddres.hausnummer = reguser.l_hausnummer;
        laddres.land = reguser.l_land;
        laddres.postleitzahl = reguser.l_postleitzahl;
        laddres.stadt = reguser.l_stadt;
        laddres.strasse = reguser.l_strasse;
        user.lieferadresse = laddres;
      }
      const userNew = await this.repo.save(user);
      userNew.password = '';
      return userNew;
    } catch (err) {
      return err;
    }
  }
  async getUserDetails(userid: number) {
    try {
      const user = await this.repo.findOne({
        where: { id: userid },
        relations: {
          adresse: true,
          lieferadresse: true,
        },
      });
      user.password = '';
      return user;
    } catch (err) {
      return err;
    }
  }
  async updateUser(item: UserUpdateDto) {
    try {
      return (await this.repo.update({ id: item.id }, item)).affected;
    } catch (err) {
      return err;
    }
  }
  async changePassword(item: NewPassword) {
    try {
      const user = await this.repo.findOne({ where: { id: item.userid } });
      const passwordMatch = await bcrypt.compare(
        item.altPassword,
        user.password,
      );
      if (!passwordMatch) {
        throw new HttpException(
          ' Das falsche Passwort wurde eingegeben. ',
          HttpStatus.BAD_REQUEST,
        );
      }

      user.password = await bcrypt.hash(item.newPassword, 10);
      return (await this.repo.update({ id: item.userid }, user)).affected;
    } catch (err) {
      return err;
    }
  }
}
