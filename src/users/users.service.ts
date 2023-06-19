import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from 'src/dto/register.dto';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Kunde } from 'src/entity/kundeEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
  async createUser(reguser: RegisterUserDto) {
    try {
      const userzahl = await this.repo.findAndCount().then((res) => res[1]);
      console.log('user zahl' + userzahl);
      console.log('l ad' + reguser.l_hausnummer);
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

      if (reguser.l_hausnummer !== null) {
        const laddres = new Lieferadresse();
        laddres.hausnummer = reguser.l_hausnummer;
        laddres.land = reguser.l_land;
        laddres.postleitzahl = reguser.l_postleitzahl;
        laddres.stadt = reguser.l_stadt;
        laddres.strasse = reguser.l_strasse;
        user.lieferadresse = laddres;
      }

      return await this.repo.save(user);
    } catch (err) {
      return err;
    }
  }
}
