import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Result } from '../../results/entities/result.entity';

@Entity('constructors')
export class ConstructorTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'constructor_ref', unique: true })
  constructor_ref: string;

  @Column()
  name: string;

  @Column()
  nationality: string;

  @OneToMany(() => Result, result => result.constructorTeam)
  results: Result[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
