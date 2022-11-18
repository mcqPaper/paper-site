// Uncomment these imports to begin using these cool features!
import {inject} from '@loopback/core'
import {DataObject, repository} from '@loopback/repository'
import {get, param, post, requestBody} from '@loopback/rest'
import {logger} from '../config'
import {AuthorizationType, paperDetails, Question} from '../models'
import {PaperRepository, ProjectRepository, QuestionRepository} from '../repositories'
import {JsonWebTokenService, JSON_WEB_TOKEN_SERVICE} from '../services'

// import {inject} from '@loopback/core';


export class PaperController {
  constructor(
    @repository(ProjectRepository)
    protected projectRepository: ProjectRepository,
    @repository(PaperRepository)
    protected paperRepository: PaperRepository,
    @repository(QuestionRepository)
    protected questionRepository: QuestionRepository,
    @inject(JSON_WEB_TOKEN_SERVICE)
    private jsonWebToken: JsonWebTokenService,
  ) { }


  @post('api/papers/create')
  async createPaper(
    @param.header.string('Authorization') accessToken: string,
    @requestBody() paperDetails: paperDetails,
  ) {
    logger.debug(`project create  initiated for project Name: ${paperDetails.name}`)

    await this.jsonWebToken.verifyWebToken(accessToken, [AuthorizationType.ADMIN_ONLY]);

    let paper = await this.paperRepository.create({
      name: paperDetails.name,
      type: paperDetails.type,
      year: paperDetails.year,
      projectId: paperDetails.projectId,
      choiceCount: paperDetails.choiceCount,
      questionCount: paperDetails.questionCount
    })

    let questionList: DataObject<Question>[] = []
    for (let questionNumber = 1; questionNumber < paperDetails.questionCount + 1; questionNumber++) {
      questionList.push({
        questionNumber: questionNumber,
        projectId: paperDetails.projectId,
        paperId: paper.id
      })
    }
    await this.questionRepository.createAll(questionList)

    return {
      success: true,
      projectId: paperDetails.projectId,
      paperId: paper.id
    }
  }


  @get('api/papers/{projectId}/list')
  async getPaperList(
    @param.header.string('Authorization') accessToken: string,
    @param.path.string('projectId') projectId: string
  ) {
    logger.debug(`get project list of projectId: ${projectId}`)

    await this.jsonWebToken.verifyWebToken(accessToken, [AuthorizationType.ADMIN_ONLY]);

    return await this.paperRepository.find({where: {projectId: projectId}})
  }


  @post('api/papers/{papertId}/edit')
  async editPaper(
    @param.header.string('Authorization') accessToken: string,
    @param.path.string('papertId') papertId: string,
    @requestBody() paperDetails: paperDetails,
  ) {
    logger.debug(`project create  initiated for project Name: ${paperDetails.name}`)

    await this.jsonWebToken.verifyWebToken(accessToken, [AuthorizationType.ADMIN_ONLY]);

    return await this.paperRepository.updateById(papertId, {
      name: paperDetails.name,
      type: paperDetails.type,
      year: paperDetails.year,
      projectId: paperDetails.projectId,
      choiceCount: paperDetails.choiceCount,
      questionCount: paperDetails.questionCount
    })
  }
}
