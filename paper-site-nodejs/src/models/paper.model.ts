import {Entity, model, property} from '@loopback/repository';

@model()
export class Paper extends Entity {
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
    type: 'number',
  })
  type?: number;

  @property({
    type: 'string',
  })
  year?: string;

  @property({
    type: 'string',
  })
  projectId?: string;

  @property({
    type: 'number',
  })
  questionCount?: number;

  @property({
    type: 'number',
  })
  choiceCount?: number;


  constructor(data?: Partial<Paper>) {
    super(data);
  }
}

export interface PaperRelations {
  // describe navigational properties here
}

export type PaperWithRelations = Paper & PaperRelations;

export interface paperDetails {
  id: string;
  name: string;
  type: number;
  projectId: string;
  year: string;
  questionCount: number;
  choiceCount: number
}
