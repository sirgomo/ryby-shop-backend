import { env } from 'src/env/env';
import { createConnection, Connection } from 'mysql2/promise';
export class Database {
  async checkDatabaseConnection(): Promise<Connection> {
    try {
      const connection = await createConnection({
        host: env.host,
        user: env.user,
        password: env.pass,
        database: env.db,
      });
      console.log('Database ok');
      return connection;
    } catch (error) {
      console.error('Błąd połączenia z bazą danych:', error);
      console.log('Tworzenie bazy danych...');
      const connection = await createConnection({
        host: env.host,
        user: env.user,
        password: env.pass,
        multipleStatements: true,
      });
      await connection
        .query(
          `CREATE DATABASE IF NOT EXISTS ${env.db};
          USE ${env.db};
         
          CREATE TABLE IF NOT EXISTS liefer_addresse (
            id INT AUTO_INCREMENT PRIMARY KEY,
            strasse VARCHAR(255),
            hausnummer VARCHAR(255),
            stadt VARCHAR(255),
            postleitzahl VARCHAR(255),
            land VARCHAR(255)
          );
          CREATE TABLE IF NOT EXISTS address_kunde (
            id INT AUTO_INCREMENT PRIMARY KEY,
            strasse VARCHAR(255),
            hausnummer VARCHAR(255),
            stadt VARCHAR(255),
            postleitzahl VARCHAR(255),
            land VARCHAR(255)
          );
          CREATE TABLE IF NOT EXISTS liferant (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255),
            telefon VARCHAR(255),
            adresse_id INT,
            steuernummer VARCHAR(255),
            bankkontonummer VARCHAR(255),
            ansprechpartner VARCHAR(255),
            zahlart VARCHAR(255),
            umsatzsteuerIdentifikationsnummer VARCHAR(255),
            FOREIGN KEY (adresse_id) REFERENCES liefer_addresse (id)
          );
          CREATE TABLE IF NOT EXISTS produkt (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            preis DECIMAL,
            beschreibung VARCHAR(255),
            foto VARCHAR(255),
            thumbnail VARCHAR(255),
            lieferant_id INT,
            datumHinzugefuegt DATE,
            verfgbarkeit BOOLEAN,
            mindestmenge INT,
            aktion BOOLEAN,
            verkaufteAnzahl INT,
            mehrwehrsteuer INT,
            FOREIGN KEY (lieferant_id) REFERENCES liferant (id)
          );
          CREATE TABLE IF NOT EXISTS lager (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            adresse VARCHAR(255)
          );
          
          CREATE TABLE IF NOT EXISTS stellplatze (
            id INT AUTO_INCREMENT PRIMARY KEY,
            platzid VARCHAR(255),
            lager_id INT,
            lieferant_id INT,
            menge INT,
            bestand INT,
            mhd DATE,
            static INT,
            prufziffern INT,
            gesperrt BOOLEAN,
            FOREIGN KEY (lager_id) REFERENCES lager (id),
            FOREIGN KEY (lieferant_id) REFERENCES liferant (id)
          );
          
          CREATE TABLE IF NOT EXISTS reservierung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            menge INT
          );
          
          CREATE TABLE IF NOT EXISTS aktion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            startdatum DATE,
            enddatum DATE,
            rabattProzent DECIMAL
          );
          CREATE TABLE IF NOT EXISTS waren_eingang (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lieferant_id INT,
            empfangsdatum DATE,
            rechnung VARCHAR(255),
            lieferscheinNr VARCHAR(255),
            datenEingabe DATE,
            FOREIGN KEY (lieferant_id) REFERENCES liferant (id)
          );

          CREATE TABLE IF NOT EXISTS waren_eingang_product (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wareneingang_id INT,
            menge INT,
            preis DECIMAL,
            mwst INT,
            FOREIGN KEY (wareneingang_id) REFERENCES waren_eingang (id)
          );
          CREATE TABLE IF NOT EXISTS kunde (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vorname VARCHAR(255),
            nachname VARCHAR(255),
            password VARCHAR(255),
            adresse_id INT,
            lieferadresse_id INT,
            email VARCHAR(255),
            telefon VARCHAR(255),
            role VARCHAR(255),
            registrierungsdatum DATE,
            treuepunkte INT,
            FOREIGN KEY (adresse_id) REFERENCES address_kunde (id),
            FOREIGN KEY (lieferadresse_id) REFERENCES liefer_addresse (id)
          );
          CREATE TABLE IF NOT EXISTS kategorie (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id INT,
            name VARCHAR(255),
            FOREIGN KEY (parent_id) REFERENCES kategorie (id)
          );
          CREATE TABLE IF NOT EXISTS bestellung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kunde_id INT,
            bestelldatum DATE,
            status VARCHAR(255),
            lieferdatum DATE,
            zahlungsart VARCHAR(255),
            gesamtwert DECIMAL,
            zahlungsstatus VARCHAR(255),
            FOREIGN KEY (kunde_id) REFERENCES kunde (id)
          );
          CREATE TABLE IF NOT EXISTS waren_ausgang (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellung_id INT,
            ausgangsdatum DATE,
            rechnung VARCHAR(255),
            datenEingabe DATE,
            zahlungsstatus VARCHAR(255),
            FOREIGN KEY (bestellung_id) REFERENCES bestellung (id)
          );
          CREATE TABLE IF NOT EXISTS waren_ausgang_product (
            id INT AUTO_INCREMENT PRIMARY KEY,
            warenausgang_id INT,
            menge INT,
            preis DECIMAL,
            mwst INT,
            FOREIGN KEY (warenausgang_id) REFERENCES waren_ausgang (id)
          );
          CREATE TABLE IF NOT EXISTS product_ruckgabe (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellung_id INT,
            kunde_id INT,
            rueckgabegrund VARCHAR(255),
            rueckgabedatum DATE,
            rueckgabestatus VARCHAR(255),
            FOREIGN KEY (bestellung_id) REFERENCES bestellung (id),
            FOREIGN KEY (kunde_id) REFERENCES kunde (id)
          );
            
          CREATE TABLE IF NOT EXISTS product_in_bestellung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellung_id INT,
            produkt_id INT,
            menge INT,
            rabatt DECIMAL,
            mengeGepackt INT,
            productRucgabe_id INT,
            FOREIGN KEY (bestellung_id) REFERENCES bestellung (id),
            FOREIGN KEY (produkt_id) REFERENCES produkt (id),
            FOREIGN KEY (productRucgabe_id) REFERENCES product_ruckgabe (id)
          );
          
          CREATE TABLE IF NOT EXISTS kunden_bewertung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kunde_id INT,
            produkt_id INT,
            titel VARCHAR(255),
            inhalt VARCHAR(255),
            bewertung INT,
            datumHinzugefuegt DATE,
            FOREIGN KEY (kunde_id) REFERENCES kunde (id),
            FOREIGN KEY (produkt_id) REFERENCES produkt (id)
          );
          
          CREATE TABLE IF NOT EXISTS produkt_kategorie (
            produkt_id INT,
            kategorie_id INT,
            FOREIGN KEY (produkt_id) REFERENCES produkt (id),
            FOREIGN KEY (kategorie_id) REFERENCES kategorie (id)
          );
          
          CREATE TABLE IF NOT EXISTS produkt_aktion (
            produkt_id INT,
            aktion_id INT,
            FOREIGN KEY (produkt_id) REFERENCES produkt (id),
            FOREIGN KEY (aktion_id) REFERENCES aktion (id)
          );
          
          CREATE TABLE IF NOT EXISTS reservierung_bestellung (
            reservierung_id INT,
            bestellung_id INT,
            FOREIGN KEY (reservierung_id) REFERENCES reservierung (id),
            FOREIGN KEY (bestellung_id) REFERENCES bestellung (id)
          );
          
          CREATE TABLE IF NOT EXISTS produkt_in_bestellung_produkt (
            produkt_in_bestellung_id INT,
            produkt_id INT,
            FOREIGN KEY (produkt_in_bestellung_id) REFERENCES product_in_bestellung (id),
            FOREIGN KEY (produkt_id) REFERENCES produkt (id)
          );
          
          CREATE TABLE IF NOT EXISTS bestellen_produkt_ruckgabe (
            bestellung_id INT,
            produkt_ruckgabe_id INT,
            FOREIGN KEY (bestellung_id) REFERENCES bestellung (id),
            FOREIGN KEY (produkt_ruckgabe_id) REFERENCES product_ruckgabe (id)
          );
          
          CREATE TABLE IF NOT EXISTS produkt_lagerorte (
            produkt_id INT,
            stellplatze_id INT,
            FOREIGN KEY (produkt_id) REFERENCES produkt (id),
            FOREIGN KEY (stellplatze_id) REFERENCES stellplatze (id)
          );
          
          CREATE TABLE IF NOT EXISTS waren_eingang_product_produkt (
            waren_eingang_product_id INT,
            produkt_id INT,
            FOREIGN KEY (waren_eingang_product_id) REFERENCES waren_eingang_product (id),
            FOREIGN KEY (produkt_id) REFERENCES produkt (id)
          );
          
          CREATE TABLE IF NOT EXISTS waren_ausgang_product_produkt (
            waren_ausgang_product_id INT,
            produkt_id INT,
            FOREIGN KEY (waren_ausgang_product_id) REFERENCES waren_ausgang_product (id),
            FOREIGN KEY (produkt_id) REFERENCES produkt (id)
          );
          
          CREATE TABLE IF NOT EXISTS waren_eingang_product_wareneingang (
            waren_eingang_product_id INT,
            wareneingang_id INT,
            FOREIGN KEY (waren_eingang_product_id) REFERENCES waren_eingang_product (id),
            FOREIGN KEY (wareneingang_id) REFERENCES waren_eingang (id)
          );
          
          CREATE TABLE IF NOT EXISTS waren_ausgang_product_warenausgang (
            waren_ausgang_product_id INT,
            warenausgang_id INT,
            FOREIGN KEY (waren_ausgang_product_id) REFERENCES waren_ausgang_product (id),
            FOREIGN KEY (warenausgang_id) REFERENCES waren_ausgang (id)
          );
          
          CREATE TABLE IF NOT EXISTS stellplatze_produkt (
            stellplatze_id INT,
            produkt_id INT,
            FOREIGN KEY (stellplatze_id) REFERENCES stellplatze (id),
            FOREIGN KEY (produkt_id) REFERENCES produkt (id)
          );
          
        `,
        )
        .then(
          (res) => {
            console.log(res);
          },
          (err) => {
            console.log(err);
          },
        );

      console.log('Utworzono bazę danych');
      return connection;
    }
  }
}
