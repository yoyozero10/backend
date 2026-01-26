import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    fullName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ type: 'enum', enum: ['customer', 'admin'], default: 'customer' })
    role: string;

    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status: string;
}
