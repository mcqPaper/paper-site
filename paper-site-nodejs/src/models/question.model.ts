import {Entity, model, property} from '@loopback/repository';

@model()
export class Question extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'number',
  })
  questionNumber?: number;

  @property({
    type: 'string',
  })
  projectId?: string;

  @property({
    type: 'string',
  })
  paperId?: string;

  @property({
    type: 'number',
    default: null
  })
  correctChoice?: number;

  @property({
    type: 'object',
    default: {
      text: ''
    }
  })
  question?: Question;

  @property({
    type: 'array',
    itemType: 'object',
    default: []
  })
  choiceArray?: Choice[];


  constructor(data?: Partial<Question>) {
    super(data);
  }
}

export interface QuestionRelations {
  // describe navigational properties here
}

export type QuestionWithRelations = Question & QuestionRelations;

export interface questionDetails {
  question: Question,
  correctChoice: number,
  choiceArray: Choice[]
}


export interface Question {
  text: string
}

export interface Choice {
  id: number,
  value: string
}
