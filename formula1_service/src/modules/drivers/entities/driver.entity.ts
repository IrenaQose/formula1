import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Result } from '../../results/entities/result.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  driver_ref: string;

  @Column({ nullable: true })
  permanent_number: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column()
  nationality: string;

  @OneToMany(() => Result, result => result.driver)
  results: Result[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 