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

/**
 * A service responsible for handling user-related operations.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Kunde) private readonly repo: Repository<Kunde>,
    @InjectRepository(AdresseKunde)
    private readonly addressRepo: Repository<AdresseKunde>,
    @InjectRepository(Lieferadresse)
    private readonly laddRepo: Repository<Lieferadresse>,
  ) {}

  /**
   * Finds a user by their email.
   * @param email The email of the user to find.
   * @returns The found user or undefined if not found.
   */
  async findOne(email: string) {
    return await this.repo.findOne({
      where: {
        email: email,
      },
    });
  }

  /**
   * Creates a new user based on the provided data.
   * @param reguser The data to create a new user.
   * @returns The newly created user.
   * @throws HttpException if an error occurs during user creation.
   */
  async createUser(reguser: RegisterUserDto): Promise<Kunde> {
    try {
      // Check the number of existing users
      const userzahl = await this.repo
        .findAndCount()
        .then((res) => res[1])
        .catch((err) => {
          console.log(err);
          throw new HttpException(
            'Etwas ist schiefgelaufen bei user registrieren',
            HttpStatus.BAD_REQUEST,
          );
        });

      // Create a new user instance
      const user = new Kunde();
      user.email = reguser.email;
      user.password = await bcrypt.hash(reguser.password, 10);
      user.nachname = reguser.nachname;
      user.vorname = reguser.vorname;
      user.registrierungsdatum = new Date(reguser.registrierungsdatum);
      user.role = 'USER';
      if (userzahl === 0) {
        user.role = 'ADMIN';
      }
      user.telefon = reguser.telefon;
      user.treuepunkte = 0;

      // Create and associate the address with the user
      const address = new AdresseKunde();
      address.hausnummer = reguser.adresseHausnummer;
      address.land = reguser.adresseLand;
      address.postleitzahl = reguser.adressePostleitzahl;
      address.stadt = reguser.adresseStadt;
      address.strasse = reguser.adresseStrasse;
      user.adresse = address;

      // Create and associate the delivery address with the user, if provided
      if (reguser.l_hausnummer !== 'null') {
        const laddres = new Lieferadresse();
        laddres.shipping_name = reguser.shipping_name;
        laddres.hausnummer = reguser.l_hausnummer;
        laddres.land = reguser.l_land;
        laddres.postleitzahl = reguser.l_postleitzahl;
        laddres.stadt = reguser.l_stadt;
        laddres.strasse = reguser.l_strasse;
        user.lieferadresse = laddres;
      }

      // Save the user in the database
      const userNew = await this.repo.save(user).catch((err) => {
        console.log(err);
        throw new HttpException(
          'Etwas ist schiefgelaufen bei user registrieren',
          HttpStatus.BAD_REQUEST,
        );
      });

      userNew.password = '';
      return userNew;
    } catch (err) {
      return err;
    }
  }

  /**
   * Retrieves the details of a user.
   * @param userid The ID of the user to retrieve details for.
   * @returns The details of the user.
   * @throws HttpException if the user details are not found.
   */
  async getUserDetails(userid: number) {
    try {
      const user = await this.repo
        .findOne({
          where: { id: userid },
          relations: {
            adresse: true,
            lieferadresse: true,
          },
        })
        .catch((err) => {
          console.log(err);
          throw new HttpException(
            'User Details nicht gefunden',
            HttpStatus.BAD_REQUEST,
          );
        });
      if (user) user.password = ''; // Omit the password from the response
      return user;
    } catch (err) {
      return err;
    }
  }

  /**
   * Updates a user with the provided data.
   * @param item The data to update the user.
   * @returns 1 if the user is successfully updated.
   * @throws HttpException if an error occurs during user update.
   */
  async updateUser(item: UserUpdateDto) {
    try {
      const items = await this.repo.create(item);
      return await this.repo.save(items).then(
        (data) => {
          if (data) return 1;
        },
        (err) => {
          console.log(err);
          throw new HttpException(
            'User Update - Ich kann die Daten nicht speichern',
            HttpStatus.BAD_REQUEST,
          );
        },
      );
    } catch (err) {
      return err;
    }
  }

  /**
   * Changes the password for a user.
   * @param item The data to change the password.
   * @returns The number of affected rows (1 if the password is successfully changed).
   * @throws HttpException if an error occurs during password change or the provided password is incorrect.
   */
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
      return this.repo
        .update({ id: item.userid }, user)
        .then((res) => {
          return res.affected;
        })
        .catch(() => {
          throw new Error('Change password failed');
        });
    } catch (err) {
      throw err;
    }
  }
}
