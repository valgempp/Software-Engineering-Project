import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'benchmarks' })
export class Benchmark {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}
