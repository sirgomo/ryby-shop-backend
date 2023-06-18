import { env } from 'env/env';
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

        CREATE TABLE IF NOT EXISTS Lieferadresse (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kundeId INT,
          strasse VARCHAR(255),
          hausnummer VARCHAR(255),
          stadt VARCHAR(255),
          postleitzahl VARCHAR(255),
          land VARCHAR(255)
      );

          CREATE TABLE IF NOT EXISTS AdresseKunde (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kundeId INT,
            strasse VARCHAR(255),
            hausnummer VARCHAR(255),
            stadt VARCHAR(255),
            postleitzahl VARCHAR(255),
            land VARCHAR(255)
        );

        
        CREATE TABLE IF NOT EXISTS Kunde (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vorname VARCHAR(255),
          nachname VARCHAR(255),
          adresseId INT,
          lieferadresseId INT,
          email VARCHAR(255),
          telefon VARCHAR(255),
          registrierungsdatum DATE,
          treuepunkte INT,
          FOREIGN KEY (adresseId) REFERENCES AdresseKunde(id),
          FOREIGN KEY (lieferadresseId) REFERENCES Lieferadresse(id)
      );

      CREATE TABLE IF NOT EXISTS Bestellung (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kundeId INT,
        bestelldatum DATE,
        status VARCHAR(255),
        lieferdatum DATE,
        zahlungsart VARCHAR(255),
        gesamtwert INT,
        zahlungsstatus VARCHAR(255),
        FOREIGN KEY (kundeId) REFERENCES Kunde(id)
    );
          CREATE TABLE IF NOT EXISTS Lieferant (
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
            FOREIGN KEY (adresseId) REFERENCES AdresseKunde(id)
        );

          CREATE TABLE IF NOT EXISTS Produkt (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            preis INT,
            beschreibung VARCHAR(255),
            foto VARCHAR(255),
            thumbnail VARCHAR(255),
            lieferantId INT,
            datumHinzugefuegt DATE,
            verfgbarkeit BOOLEAN,
            mindestmenge INT,
            aktion BOOLEAN,
            verkaufteAnzahl INT,
            mehrwehrsteuer BOOLEAN,
            FOREIGN KEY (lieferantId) REFERENCES Lieferant(id)
        );

        CREATE TABLE IF NOT EXISTS Wareneingang (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lieferantId INT,
            empfangsdatum DATE,
            rechnung VARCHAR(255),
            lieferscheinNr VARCHAR(255),
            datenEingabe DATE,
            FOREIGN KEY (lieferantId) REFERENCES Lieferant(id)
        );

        CREATE TABLE IF NOT EXISTS WareneingangProduct (
          id INT AUTO_INCREMENT PRIMARY KEY,
          wareneingangId INT,
          menge INT,
          preis INT,
          mwst INT,
          FOREIGN KEY (wareneingangId) REFERENCES Wareneingang(id)
      );
      CREATE TABLE IF NOT EXISTS Warenausgang (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bestellungId INT,
        ausgangsdatum DATE,
        rechnung VARCHAR(255),
        datenEingabe DATE,
        zahlungsstatus VARCHAR(255),
        FOREIGN KEY (bestellungId) REFERENCES Bestellung(id)
    );
        CREATE TABLE IF NOT EXISTS WarenausgangProduct (
            id INT AUTO_INCREMENT PRIMARY KEY,
            warenausgangId INT,
            menge INT,
            preis INT,
            mwst INT,
            FOREIGN KEY (warenausgangId) REFERENCES Warenausgang(id)
        );
    
        
        CREATE TABLE IF NOT EXISTS Reservierung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            menge INT
        );
        
        CREATE TABLE IF NOT EXISTS Aktion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            startdatum DATE,
            enddatum DATE,
            rabattProzent DECIMAL
        );
        

        
        CREATE TABLE IF NOT EXISTS ProduktRueckgabe (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellungId INT,
            kundeId INT,
            rueckgabegrund VARCHAR(255),
            rueckgabedatum DATE,
            rueckgabestatus VARCHAR(255),
            FOREIGN KEY (bestellungId) REFERENCES Bestellung(id),
            FOREIGN KEY (kundeId) REFERENCES Kunde(id)
        );
        
        CREATE TABLE IF NOT EXISTS ProduktInBestellung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellungId INT,
            menge INT,
            preis INT,
            rabatt INT,
            wert INT,
            mengeVerpackt INT,
            produktRucgabeId INT,
            FOREIGN KEY (bestellungId) REFERENCES Bestellung(id),
            FOREIGN KEY (produktRucgabeId) REFERENCES ProduktRueckgabe(id)
        );
        
        
        CREATE TABLE IF NOT EXISTS Lager (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            adresse VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS Stellplatze (
          id INT AUTO_INCREMENT PRIMARY KEY,
          platzid VARCHAR(255),
          lagerId INT,
          lieferantId INT,
          menge INT,
          bestand INT,
          mhd VARCHAR(255),
          static INT,
          prufziffern INT,
          gesperrt BOOLEAN,
          FOREIGN KEY (lagerId) REFERENCES Lager(id),
          FOREIGN KEY (lieferantId) REFERENCES Lieferant(id)
      );
        
        CREATE TABLE IF NOT EXISTS Kundenbewertung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kundeId INT,
            produktId INT,
            titel VARCHAR(255),
            inhalt TEXT,
            bewertung INT,
            datumHinzugefuegt DATE,
            FOREIGN KEY (kundeId) REFERENCES Kunde(id),
            FOREIGN KEY (produktId) REFERENCES Produkt(id)
        );
        
  
        
        CREATE TABLE IF NOT EXISTS Kategorie (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id INT,
            name VARCHAR(255),
            FOREIGN KEY (parent_id) REFERENCES Kategorie(id)
        );
        
 
        
    

        CREATE TABLE IF NOT EXISTS WareneingangProdukt (
            wareneingangId INT,
            produktId INT,
            PRIMARY KEY (wareneingangId, produktId),
            FOREIGN KEY (wareneingangId) REFERENCES Wareneingang(id),
            FOREIGN KEY (produktId) REFERENCES Produkt(id)
        );
        
        CREATE TABLE IF NOT EXISTS WarenausgangProdukt (
            warenausgangId INT,
            produktId INT,
            PRIMARY KEY (warenausgangId, produktId),
            FOREIGN KEY (warenausgangId) REFERENCES Warenausgang(id),
            FOREIGN KEY (produktId) REFERENCES Produkt(id)
        );
        
        CREATE TABLE IF NOT EXISTS StellplatzeProdukt (
            stellplatzeId INT,
            produktId INT,
            PRIMARY KEY (stellplatzeId, produktId),
            FOREIGN KEY (stellplatzeId) REFERENCES Stellplatze(id),
            FOREIGN KEY (produktId) REFERENCES Produkt(id)
        );
        
        CREATE TABLE IF NOT EXISTS ProduktKategorie (
            produktId INT,
            kategorieId INT,
            PRIMARY KEY (produktId, kategorieId),
            FOREIGN KEY (produktId) REFERENCES Produkt(id),
            FOREIGN KEY (kategorieId) REFERENCES Kategorie(id)
        );
        
        CREATE TABLE IF NOT EXISTS ProduktPromocje (
            produktId INT,
            promocjeId INT,
            PRIMARY KEY (produktId, promocjeId),
            FOREIGN KEY (produktId) REFERENCES Produkt(id),
            FOREIGN KEY (promocjeId) REFERENCES Aktion(id)
        );
        
        CREATE TABLE IF NOT EXISTS ReservierungProdukt (
            reservierungId INT,
            produktId INT,
            PRIMARY KEY (reservierungId, produktId),
            FOREIGN KEY (reservierungId) REFERENCES Reservierung(id),
            FOREIGN KEY (produktId) REFERENCES Produkt(id)
        );
        
        CREATE TABLE IF NOT EXISTS ProduktInBestellungProdukt (
            produktInBestellungId INT,
            produktId INT,
            PRIMARY KEY (produktInBestellungId, produktId),
            FOREIGN KEY (produktInBestellungId) REFERENCES ProduktInBestellung(id),
            FOREIGN KEY (produktId) REFERENCES Produkt(id)
        );
        
        CREATE TABLE IF NOT EXISTS KategorieKategorie (
            parentId INT,
            childId INT,
            PRIMARY KEY (parentId, childId),
            FOREIGN KEY (parentId) REFERENCES Kategorie(id),
            FOREIGN KEY (childId) REFERENCES Kategorie(id)
        );
        
        CREATE TABLE IF NOT EXISTS BestellungProdukt (
            bestellungId INT,
            produktInBestellungId INT,
            PRIMARY KEY (bestellungId, produktInBestellungId),
            FOREIGN KEY (bestellungId) REFERENCES Bestellung(id),
            FOREIGN KEY (produktInBestellungId) REFERENCES ProduktInBestellung(id)
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
