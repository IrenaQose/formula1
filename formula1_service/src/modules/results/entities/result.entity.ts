import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Race } from '../../races/entities/race.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { ConstructorTeam } from '../../constructors/entities/constructor.entity';
import { Season } from '../../seasons/entities/season.entity';

@Entity('results')
@Unique(['driverId', 'raceId'])
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  points: number;

  @Column({ nullable: true })
  position: number;

  @Column()
  grid: number;

  @Column()
  laps: number;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  time: string;

  @ManyToOne(() => Season)
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column()
  season_id: number;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column()
  driver_id: number;

  @ManyToOne(() => Race)
  @JoinColumn({ name: 'race_id' })
  race: Race;

  @Column()
  race_id: number;

  @ManyToOne(() => ConstructorTeam)
  @JoinColumn({ name: 'constructor_id' })
  constructorTeam: ConstructorTeam;

  @Column()
  constructor_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 