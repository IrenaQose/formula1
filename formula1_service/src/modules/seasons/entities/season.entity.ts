import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Result } from '../../results/entities/result.entity';
import { Race } from '../../races/entities/race.entity';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 4, unique: true })
  year: string;

  @OneToMany(() => Result, result => result.season)
  results: Result[];

  @OneToMany(() => Race, race => race.season)
  races: Race[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 