import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('company')
export class CompanyDataEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', nullable: false })
  name: string;
  @Column({ type: 'varchar', nullable: false })
  company_name: string;
  @Column({ type: 'varchar', nullable: false })
  address: string;
  @Column({ type: 'varchar', nullable: false })
  city: string;
  @Column({ type: 'varchar', nullable: false })
  postleitzahl: string;
  @Column({ type: 'varchar', nullable: false })
  country: string;
  @Column({ type: 'varchar', nullable: false })
  phone: string;
  @Column({ type: 'varchar', nullable: false })
  email: string;
  @Column({ type: 'tinyint', nullable: false })
  isKleinUnternehmen: number;
  @Column({ type: 'varchar', nullable: false })
  ustNr: string;
  @Column('varchar')
  fax: string;
  @Column('text')
  eu_komm_hinweis: string;
  @Column('text')
  agb: string;
  @Column('mediumtext')
  daten_schutzt: string;
  @Column('text')
  cookie_info: string;
  @Column('varchar')
  ebay_refresh_token: string;
  @Column('boolean')
  is_in_urlop: number;
  @Column('datetime')
  urlop_from: Date;
  @Column('datetime')
  urlop_to: Date;
}
