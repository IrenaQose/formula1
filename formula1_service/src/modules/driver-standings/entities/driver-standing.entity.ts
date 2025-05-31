import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique, JoinColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';
import { Race } from '../../races/entities/race.entity';
import { Season } from '../../seasons/entities/season.entity';
import { ConstructorTeam } from '../../constructors/entities/constructor.entity';

@Entity('driver_standings')
@Unique(['driver_id', 'season_id'])
export class DriverStanding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  driver_id: number;


  @Column()
  season_id: number;

  @Column()
  constructor_team_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  points: number;

  @Column()
  position: number;

  @Column()
  wins: number;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;


  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @ManyToOne(() => ConstructorTeam)
  @JoinColumn({ name: 'constructor_team_id' })
  constructorTeam: ConstructorTeam;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 