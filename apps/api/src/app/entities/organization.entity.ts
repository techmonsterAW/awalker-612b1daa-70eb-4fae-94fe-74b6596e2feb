import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Organization, (o) => o.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Organization | null;

  @OneToMany(() => Organization, (o) => o.parent)
  children: Organization[];

  @OneToMany(() => User, (u) => u.organization)
  users: User[];
}
