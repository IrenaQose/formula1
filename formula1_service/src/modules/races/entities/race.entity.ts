import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { Season } from '../../seasons/entities/season.entity';
import { Result } from '../../results/entities/result.entity';

@Entity('races')
export class Race {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  time: string;

  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column()
  season_id: number;

  @OneToMany(() => Result, result => result.race)
  results: Result[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 