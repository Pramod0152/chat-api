import { AutoMap } from '@automapper/classes';
import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';

@Table({ tableName: 'conversation_participants', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Participant extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @AutoMap()
  id: number;

  @Column
  @AutoMap()
  conversation_id: number;

  @Column
  @AutoMap()
  user_id: number;

  @Column
  @AutoMap()
  last_read_message_id: number;

  @Column
  @AutoMap()
  created_at: Date;

  @Column
  @AutoMap()
  updated_at: Date;

  @Column
  @AutoMap()
  deleted_at: Date;

  @BelongsTo(() => Conversation, { foreignKey: 'conversation_id', targetKey: 'id' })
  @AutoMap(() => Conversation)
  conversation: Conversation;

  @BelongsTo(() => User, { foreignKey: 'user_id', targetKey: 'id' })
  @AutoMap(() => User)
  user: User;
}
