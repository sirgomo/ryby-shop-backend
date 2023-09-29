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

          CREATE TABLE IF NOT EXISTS company (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            country VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            isKleinUnternehmen TINYINT NOT NULL,
            ustNr VARCHAR(255) NOT NULL,
            fax VARCHAR(255),
            eu_komm_hinsweis TEXT,
            agb TEXT,
            daten_schutzt TEXT,
            cookie_info TEXT,
            ebay_refresh_token VARCHAR(255),
        );
          CREATE TABLE IF NOT EXISTS liefer_addresse (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shipping_name VARCHAR(255),
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
            adresseId INT,
            steuernummer VARCHAR(255),
            bankkontonummer VARCHAR(255),
            ansprechpartner VARCHAR(255),
            zahlart VARCHAR(255),
            umsatzsteuerIdentifikationsnummer VARCHAR(255),
            FOREIGN KEY (adresseId) REFERENCES address_kunde (id) ON DELETE CASCADE ON UPDATE CASCADE
          );
          CREATE TABLE IF NOT EXISTS produkt (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            preis DECIMAL(10,2),
            artid INT NOT NULL UNIQUE,
            beschreibung MEDIUMTEXT,
            color VARCHAR(255),
            foto VARCHAR(255),
            thumbnail VARCHAR(255),
            lieferantId INT,
            datumHinzugefuegt DATE,
            verfgbarkeit BOOLEAN,
            mindestmenge INT,
            currentmenge INT,
            product_sup_id VARCHAR(255),
            lange INT,
            gewicht INT, 
            verkaufteAnzahl INT,
            mehrwehrsteuer INT,
            FOREIGN KEY (lieferantId) REFERENCES liferant (id)
          );
          CREATE TABLE IF NOT EXISTS lager (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            adresse VARCHAR(255)
          );
          
          CREATE TABLE IF NOT EXISTS stellplatze (
            id INT AUTO_INCREMENT PRIMARY KEY,
            platzid VARCHAR(255),
            lagerId INT,
            lieferantId INT,
            menge INT,
            bestand INT,
            mhd DATE,
            static INT,
            prufziffern INT,
            gesperrt BOOLEAN,
            FOREIGN KEY (lagerId) REFERENCES lager (id),
            FOREIGN KEY (lieferantId) REFERENCES liferant (id)
          );
          
          
          CREATE TABLE IF NOT EXISTS aktion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            startdatum DATE,
            enddatum DATE,
            rabattProzent DECIMAL(5,2)
          );
          CREATE TABLE IF NOT EXISTS waren_eingang (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lieferantId INT,
            empfangsdatum DATE,
            rechnung VARCHAR(255),
            lieferscheinNr VARCHAR(255),
            datenEingabe DATE,
            gebucht TINYINT,
            eingelagert TINYINT,
            FOREIGN KEY (lieferantId) REFERENCES liferant (id)
          );

          CREATE TABLE IF NOT EXISTS waren_eingang_product (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wareneingangId INT,
            menge INT,
            preis DECIMAL(10,2),
            mwst INT,
            mengeEingelagert INT,
            color VARCHAR(255),
            FOREIGN KEY (wareneingangId) REFERENCES waren_eingang (id) ON DELETE CASCADE ON UPDATE CASCADE
          );
          CREATE TABLE IF NOT EXISTS kunde (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vorname VARCHAR(255),
            nachname VARCHAR(255),
            password VARCHAR(255),
            adresseId INT,
            lieferadresseId INT,
            email VARCHAR(255),
            telefon VARCHAR(255),
            role VARCHAR(255),
            registrierungsdatum DATE,
            treuepunkte INT,
            FOREIGN KEY (adresseId) REFERENCES address_kunde (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (lieferadresseId) REFERENCES liefer_addresse (id) ON DELETE CASCADE ON UPDATE CASCADE
          );
          CREATE TABLE IF NOT EXISTS kategorie (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id INT,
            name VARCHAR(255)
          );
          CREATE TABLE IF NOT EXISTS bestellung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kundeId INT,
            bestelldatum DATE,
            status VARCHAR(255),
            versand_datum DATE,
            zahlungsart VARCHAR(255),
            gesamtwert DECIMAL(10,2),
            zahlungsstatus VARCHAR(255),
            bestellungstatus VARCHAR(255) NOT NULL,
            versandart VARCHAR(255) NOT NULL,
            versandprice DECIMAL(10,2) NOT NULL,
            varsandnr VARCHAR(255),
            FOREIGN KEY (kundeId) REFERENCES kunde (id)
          );
        
          CREATE TABLE IF NOT EXISTS product_ruckgabe (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellungId INT,
            kundeId INT,
            rueckgabegrund VARCHAR(255),
            rueckgabedatum DATE,
            rueckgabestatus VARCHAR(255),
            FOREIGN KEY (bestellungId) REFERENCES bestellung (id),
            FOREIGN KEY (kundeId) REFERENCES kunde (id)
          );
            
          CREATE TABLE IF NOT EXISTS product_in_bestellung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellungId INT,
            produktId INT,
            menge INT,
            color VARCHAR(255),
            color_gepackt(255),
            rabatt DECIMAL(5,2),
            mengeGepackt INT,
            verkauf_price DECIMAL(10,2),
            verkauf_rabat DECIMAL(10,2),
            verkauf_steuer DECIMAL(10,2),
            productRucgabeId INT,
            FOREIGN KEY (bestellungId) REFERENCES bestellung (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (produktId) REFERENCES produkt (id),
            FOREIGN KEY (productRucgabeId) REFERENCES product_ruckgabe (id)
          );
          
          CREATE TABLE IF NOT EXISTS kunden_bewertung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kundeId INT,
            produktId INT,
            titel VARCHAR(255),
            inhalt VARCHAR(255),
            bewertung INT,
            datumHinzugefuegt DATE,
            FOREIGN KEY (kundeId) REFERENCES kunde (id),
            FOREIGN KEY (produktId) REFERENCES produkt (id)
          );
          CREATE TABLE IF NOT EXISTS ean (
            id INT AUTO_INCREMENT PRIMARY KEY,
            productId INT,
            eanCode VARCHAR(255) UNIQUE,
            FOREIGN KEY (productId) REFERENCES produkt (id) ON DELETE CASCADE ON UPDATE CASCADE
          );
          
          CREATE TABLE IF NOT EXISTS produkt_kategorie_kategorie (
            produktId INT,
            kategorieId INT,
            FOREIGN KEY (produktId) REFERENCES produkt (id) ON DELETE CASCADE ON UPDATE CASCADE, 
            FOREIGN KEY (kategorieId) REFERENCES kategorie (id)
          );
          
          CREATE TABLE IF NOT EXISTS produkt_promocje_aktion (
            produktId INT,
            aktionId INT,
            FOREIGN KEY (produktId) REFERENCES produkt (id),
            FOREIGN KEY (aktionId) REFERENCES aktion (id)
          );
          
          CREATE TABLE IF NOT EXISTS product_in_bestellung_produkt_produkt (
            productInBestellungId INT,
            produktId INT,
            FOREIGN KEY (productInBestellungId) REFERENCES product_in_bestellung (id),
            FOREIGN KEY (produktId) REFERENCES produkt (id)
          );
          
          CREATE TABLE IF NOT EXISTS bestellen_produkt_ruckgabe (
            bestellung_id INT,
            produkt_ruckgabe_id INT,
            FOREIGN KEY (bestellung_id) REFERENCES bestellung (id),
            FOREIGN KEY (produkt_ruckgabe_id) REFERENCES product_ruckgabe (id)
          );
          
          CREATE TABLE IF NOT EXISTS produkt_lagerorte_stellplatze (
            produktId INT,
            stellplatzeId INT,
            FOREIGN KEY (produktId) REFERENCES produkt (id),
            FOREIGN KEY (stellplatzeId) REFERENCES stellplatze (id)
          );
          
          CREATE TABLE IF NOT EXISTS waren_eingang_product_produkt_produkt (
            warenEingangProductId INT,
            produktId INT,
            FOREIGN KEY (warenEingangProductId) REFERENCES waren_eingang_product (id) ON DELETE CASCADE,
            FOREIGN KEY (produktId) REFERENCES produkt (id)
          );
          
          CREATE TABLE IF NOT EXISTS produkt_wareneingang_waren_eingang_product (
            warenEingangProductId INT,
            produktId INT,
            FOREIGN KEY (warenEingangProductId) REFERENCES waren_eingang_product (id),
            FOREIGN KEY (produktId) REFERENCES produkt (id)
          );

          CREATE TABLE IF NOT EXISTS waren_eingang_product_wareneingang (
            waren_eingang_productId INT,
            wareneingangId INT,
            FOREIGN KEY (waren_eingang_productId) REFERENCES waren_eingang_product (id),
            FOREIGN KEY (wareneingangId) REFERENCES waren_eingang (id)
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
            console.log('Database created');
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
