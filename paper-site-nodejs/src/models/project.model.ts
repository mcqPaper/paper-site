import {Entity, model, property} from '@loopback/repository';

@model()
export class Project extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'object',
  })
  results?: RESULTS;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'string',
  })
  createdById?: string;

  @property({
    type: 'string',
  })
  createdBy?: string;


  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
}

export type ProjectWithRelations = Project & ProjectRelations;


export interface ProjectDetails {
  id?: string;
  name?: string;
  results?: any;
}

export interface RESULTS {
  "totalQuestions": number,
  "correctAnswers": number,
  "timeTaken": number,
  "questionsAndAnswers": ANSWERS
}

export interface ANSWERS {
  "question": string,
  "user_answer": string,
  "correct_answer": string,
  "point": number
}
