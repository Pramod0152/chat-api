import { AutoMap } from '@automapper/classes';
import { BelongsTo, Column, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { Participant } from './participant.entity';
import { User } from './user.entity';

@Table({ tableName: 'conversations', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Conversation extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @AutoMap()
  id: number;

  @Column
  @AutoMap()
  admin_id: number;

  @Column
  @AutoMap()
  type: string;

  @Column
  @AutoMap()
  group_name: string;

  @Column
  @AutoMap()
  group_image: string;

  @Column
  @AutoMap()
  status: string;

  @Column
  @AutoMap()
  created_at: Date;

  @Column
  @AutoMap()
  updated_at: Date;

  @Column
  @AutoMap()
  deleted_at: Date;

  @BelongsTo(() => User, { foreignKey: 'admin_id', targetKey: 'id' })
  @AutoMap(() => User)
  admin: User;

  @HasMany(() => Participant, { foreignKey: 'conversation_id', sourceKey: 'id' })
  @AutoMap(() => [Participant])
  participants: Participant[];

  @HasOne(() => Participant, { foreignKey: 'conversation_id', sourceKey: 'id' })
  @AutoMap(() => Participant)
  participant: Participant;
}
