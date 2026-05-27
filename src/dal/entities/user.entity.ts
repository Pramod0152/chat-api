import { AutoMap } from '@automapper/classes';
import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @AutoMap()
  id: number;

  @Column
  @AutoMap()
  username: string;

  @Column
  @AutoMap()
  email: string;

  @Column
  @AutoMap()
  password: string;

  @Column
  @AutoMap()
  profile_image: string;

  @Column
  @AutoMap()
  bio: string;

  @Column
  @AutoMap()
  location: string;

  @Column
  @AutoMap()
  created_at: Date;

  @Column
  @AutoMap()
  updated_at: Date;
}
