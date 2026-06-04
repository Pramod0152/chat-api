import { AutoMap } from '@automapper/classes';
import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  tableName: 'user_device_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserDeviceDetail extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @AutoMap()
  id: number;

  @Column
  @AutoMap()
  user_id: number;

  @Column
  @AutoMap()
  device_id: string;

  @Column
  @AutoMap()
  device_type: string;

  @Column
  @AutoMap()
  fcm_token: string;

  @Column
  @AutoMap()
  version: string;

  @Column
  @AutoMap()
  status: number;

  @Column
  @AutoMap()
  created_at: Date;

  @Column
  @AutoMap()
  updated_at: Date;

  @Column
  @AutoMap()
  deleted_at: Date;

  @BelongsTo(() => User, { foreignKey: 'user_id', targetKey: 'id' })
  @AutoMap(() => User)
  user: User;
}
