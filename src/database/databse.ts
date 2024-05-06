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
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            company_name VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            postleitzahl VARCHAR(255) NOT NULL,
            country VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            isKleinUnternehmen TINYINT NOT NULL,
            ustNr VARCHAR(255) NOT NULL,
            fax VARCHAR(255),
            eu_komm_hinweis TEXT,
            agb TEXT,
            daten_schutzt MEDIUMTEXT,
            cookie_info TEXT,
            ebay_refresh_token VARCHAR(255),
            is_in_urlop BOOLEAN DEFAULT 0,
            urlop_from DATE,
            urlop_to DATE
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
            sku VARCHAR(255),
            artid INT NOT NULL UNIQUE,
            beschreibung MEDIUMTEXT,
            lieferantId INT,
            datumHinzugefuegt DATE,
            verfgbarkeit BOOLEAN,
            product_sup_id VARCHAR(255),
            ebay TINYINT DEFAULT 0,
            mehrwehrsteuer INT,
            produkt_image VARCHAR(1000),
            FOREIGN KEY (lieferantId) REFERENCES liferant (id)
          );
          CREATE TABLE IF NOT EXISTS lager (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            adresse VARCHAR(255)
          );
          CREATE TABLE IF NOT EXISTS destruction_protocol (
            id INT AUTO_INCREMENT PRIMARY KEY,
            produktId INT NOT NULL,
            variationId VARCHAR(255) NOT NULL,
            produkt_name VARCHAR(255) NOT NULL,
            quantity INT NOT NULL,
            quantity_at_once INT NOT NULL,
            type VARCHAR(55) NOT NULL,
            destruction_date DATE NOT NULL,
            responsible_person VARCHAR(255) NOT NULL,
            status VARCHAR(55) NOT NULL,
            description TEXT
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
          CREATE TABLE variations (
            sku VARCHAR(255) NOT NULL PRIMARY KEY,
            produktId INT,
            variations_name VARCHAR(255),
            hint VARCHAR(255),
            value VARCHAR(255),
            unit VARCHAR(255),
            image VARCHAR(1000),
            price DECIMAL(10,2),
            wholesale_price DECIMAL(10,2),
            thumbnail VARCHAR(1000),
            quanity INT,
            quanity_sold INT,
            quanity_sold_at_once INT DEFAULT 1,
            FOREIGN KEY (produktId) REFERENCES produkt (id) ON DELETE CASCADE ON UPDATE CASCADE
        );
          
          CREATE TABLE IF NOT EXISTS aktion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            aktion_key VARCHAR(255) NOT NULL
            startdatum DATE,
            enddatum DATE,
            rabattProzent DECIMAL(5,2)
          );
          CREATE TABLE IF NOT EXISTS waren_eingang (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lieferantId INT,
            empfangsdatum DATETIME,
            rechnung VARCHAR(255),
            lieferscheinNr VARCHAR(255),
            datenEingabe DATETIME,
            gebucht TINYINT,
            eingelagert TINYINT,
            shipping_cost DECIMAL(10,2) DEFAULT 0,
            remarks VARCHAR(500),
            other_cost DECIMAL(10,2) DEFAULT 0,
            locationId INT,
            wahrung varchar(3) DEFAULT 'EUR',
            wahrung2 varchar(3) DEFAULT 'EUR',
            wahrung_rate decimal(10,4) DEFAULT '1.00',
            shipping_cost_eur DECIMAL(10,2) DEFAULT 0,
            other_cost_eur DECIMAL(10,2) DEFAULT 0,
            FOREIGN KEY (lieferantId) REFERENCES liferant (id),
            FOREIGN KEY (locationId) REFERENCES lager (id)
          );

          CREATE TABLE IF NOT EXISTS waren_eingang_product (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wareneingangId INT,
            FOREIGN KEY (wareneingangId) REFERENCES waren_eingang (id) ON DELETE CASCADE ON UPDATE CASCADE
          );
          CREATE TABLE waren_eingang_prod_variation (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sku VARCHAR(255) NOT NULL,
            quanity INT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            price_in_euro DECIMAL(10,2) NOT NULL,
            mwst INT NOT NULL DEFAULT 0,
            quanity_stored INT NOT NULL DEFAULT 0,
            quanity_sold_at_once INT DEFAULT 1,
            waren_eingang_productId INT,
            FOREIGN KEY (waren_eingang_productId) REFERENCES waren_eingang_product (id) ON DELETE CASCADE ON UPDATE CASCADE
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
            bestelldatum DATETIME,
            status VARCHAR(255),
            versand_datum DATETIME,
            zahlungsart VARCHAR(255),
            gesamtwert DECIMAL(10,2),
            zahlungsstatus VARCHAR(255),
            shipping_address_json VARCHAR(1000),
            bestellungstatus VARCHAR(255) NOT NULL,
            versandart VARCHAR(255) NOT NULL,
            versandprice DECIMAL(10,2) NOT NULL,
            varsandnr VARCHAR(255),
            paypal_order_id VARCHAR(255),
            FOREIGN KEY (kundeId) REFERENCES kunde (id)
          );
          
          CREATE TABLE IF NOT EXISTS product_ruckgabe (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellungId INT,
            kundeId INT,
            rueckgabegrund VARCHAR(255),
            rueckgabedatum DATE,
            rueckgabestatus VARCHAR(255),
            amount DECIMAL(10,2),
            paypal_refund_id VARCHAR(255),
            paypal_refund_status VARCHAR(255),
            paypal_transaction_id VARCHAR(255),
            corrective_refund_nr INT,
            is_corrective TINYINT DEFAULT 0,
            FOREIGN KEY (bestellungId) REFERENCES bestellung (id),
            FOREIGN KEY (kundeId) REFERENCES kunde (id)
          );
            
          CREATE TABLE IF NOT EXISTS product_in_bestellung (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bestellungId INT,
            produktId INT,
            menge INT,
            color VARCHAR(1000),
            color_gepackt VARCHAR(1000),
            rabatt DECIMAL(5,2),
            mengeGepackt INT,
            verkauf_price DECIMAL(10,2),
            verkauf_rabat DECIMAL(10,2),
            verkauf_steuer DECIMAL(10,2),
            productRucgabeId INT,
            FOREIGN KEY (bestellungId) REFERENCES bestellung (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (produktId) REFERENCES produkt (id),
            FOREIGN KEY (productRucgabeId) REFERENCES product_ruckgabe (id) ON DELETE CASCADE ON UPDATE CASCADE
          );
          CREATE TABLE shipping_costs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            shipping_name VARCHAR(255) NOT NULL,
            shipping_price DECIMAL(10, 2) NOT NULL,
            average_material_price DECIMAL(10, 2) NOT NULL,
            cost_per_added_stuck DECIMAL(10,2) NOT NULL DEFAULT 0
        );
        
        CREATE TABLE produkt_shipping_costs (
            produktId INT NOT NULL,
            shippingCostsId INT NOT NULL,
            PRIMARY KEY (produktId, shippingCostsId),
            FOREIGN KEY (produktId) REFERENCES produkt (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (shippingCostsId) REFERENCES shipping_costs (id) ON DELETE CASCADE ON UPDATE CASCADE
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
          CREATE TABLE ebay_transactions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            orderId VARCHAR(255) NOT NULL UNIQUE,
            creationDate DATETIME NOT NULL,
            price_total DECIMAL(10,2) NOT NULL,
            price_shipping DECIMAL(10,2) NOT NULL,
            price_tax DECIMAL(10,2) NOT NULL,
            price_discont DECIMAL(10,2) NOT NULL,
            ebay_fee DECIMAL(10,2),
            ebay_advertising_cost DECIMAL(10,2),
            sel_amount INT NOT NULL,
            payment_status VARCHAR(50) NOT NULL,
            zahlungsart VARCHAR(50)
        );
        CREATE TABLE ebay_item_sold (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255),
          sku VARCHAR(255),
          quanity INT,
          price DECIMAL(10, 2),
          transactionId INT,
          FOREIGN KEY (transactionId) REFERENCES ebay_transactions(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
        CREATE TABLE ebay_refund (
          id INT PRIMARY KEY AUTO_INCREMENT,
          orderId VARCHAR(255) NOT NULL,
          creationDate DATETIME NOT NULL,
          reason VARCHAR(100),
          comment VARCHAR(500),
          amount DECIMAL(10, 2),
          transactionId INT,
          INDEX orderId (orderId),
          FOREIGN KEY (transactionId) REFERENCES ebay_transactions(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
        CREATE TABLE ebay_refund_item (
          id INT PRIMARY KEY AUTO_INCREMENT,
          refundId INT,
          amount DECIMAL(10, 2),
          sku VARCHAR(255),
          item_quanity INT,
          FOREIGN KEY (refundId) REFERENCES ebay_refund(id) ON DELETE CASCADE ON UPDATE CASCADE
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
            FOREIGN KEY (aktionId) REFERENCES aktion (id) ON DELETE CASCADE ON UPDATE CASCADE
          );
          
          CREATE TABLE IF NOT EXISTS product_in_bestellung_produkt_produkt (
            productInBestellungId INT,
            produktId INT,
            FOREIGN KEY (productInBestellungId) REFERENCES product_in_bestellung (id),
            FOREIGN KEY (produktId) REFERENCES produkt (id)
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
          CREATE TABLE IF NOT EXISTS logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            ebay_transaction_id VARCHAR(255),
            user_email VARCHAR(255),
            paypal_transaction_id VARCHAR(255),
            error_class VARCHAR(255) NOT NULL, 
            error_message VARCHAR(2000) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
        )
        .then(
          (res) => {
            console.log('Database created');
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
