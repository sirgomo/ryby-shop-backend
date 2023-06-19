import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Stellplatze } from './stellplatzeEntity';

@Entity('lager')
export class Lager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Stellplatze, (stellplatze) => stellplatze.lager)
  lagerorte: Stellplatze[];

  @Column()
  adresse: string;
}
