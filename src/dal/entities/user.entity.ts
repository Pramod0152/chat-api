import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  username: string;

  @Column
  email: string;

  @Column
  password: string;

  @Column
  profile_image: string;

  @Column
  bio: string;

  @Column
  location: number;

  @Column
  created_at: Date;

  @Column
  updated_at: Date;
}
