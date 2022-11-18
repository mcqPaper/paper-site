import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'number',
  })
  userType: UserType;

  @property({
    type: 'string',
  })
  password: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export enum UserType {
  ADMIN = 1000,
  EDITOR = 900,
  STUDENT = 100,
  TEACHER = 200
}

export type UserWithRelations = User & UserRelations;

export enum AuthorizationType {
  ALL_USERS = 0,
  ADMIN_ONLY = 1,
  STUDENT_ONLY = 2,
  EDITOR_ONLY = 3,
  TEACHER_ONLY = 4,
}
