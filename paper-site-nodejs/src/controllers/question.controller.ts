// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody} from '@loopback/rest';
import {logger} from '../config';
import {AuthorizationType, Choice, questionDetails} from '../models';
import {PaperRepository, QuestionRepository} from '../repositories';
import {JsonWebTokenService, JSON_WEB_TOKEN_SERVICE} from '../services';


export class QuestionController {
  constructor(
    @inject(JSON_WEB_TOKEN_SERVICE)
    private jsonWebToken: JsonWebTokenService,
    @repository(QuestionRepository)
    protected questionRepository: QuestionRepository,
    @repository(PaperRepository)
    protected paperRepository: PaperRepository,
  ) { }

  @get('api/questions/{paperId}/list')
  async getPaperList(
    @param.header.string('Authorization') accessToken: string,
    @param.path.string('paperId') paperId: string
  ) {
    logger.debug(`get project list of paperId: ${paperId}`)

    await this.jsonWebToken.verifyWebToken(accessToken, [AuthorizationType.ADMIN_ONLY]);

    let paperDetails = await this.paperRepository.findById(paperId)

    let paperList = await this.questionRepository.find({
      where: {paperId: paperId}, fields: {
        question: true,
        id: true,
        correctChoice: true,
        choiceArray: true,
        questionNumber: true
      }
    })
    return {
      choiceCount: paperDetails.choiceCount,
      questionCount: paperDetails.questionCount,
      questionArray: paperList
    }
  }

  @post('api/questions/{questionId}/save')
  async questionSave(
    @param.header.string('Authorization') accessToken: string,
    @param.path.string('questionId') questionId: string,
    @requestBody() questionDetails: questionDetails,
  ) {
    logger.debug(`get project list of paperId: ${questionId}`)

    await this.jsonWebToken.verifyWebToken(accessToken, [AuthorizationType.ADMIN_ONLY]);

    try {

      // let choiceList = questionDetails.choiceArray.map(item => item ? item : {

      // })
      let choiceIndex = 0
      let choiceList: Choice[] = []
      for (let i in questionDetails.choiceArray) {
        if (questionDetails.choiceArray[i]) choiceList.push(questionDetails.choiceArray[i])
        else choiceList.push({
          id: choiceIndex,
          value: ''
        })
        choiceIndex += 1
      }
      await this.questionRepository.updateById(questionId, {
        question: questionDetails.question,
        choiceArray: choiceList,
        correctChoice: questionDetails.correctChoice
      })
      return {
        success: true
      }
    } catch (err) {
      return {
        success: false
      }
    }

  }
}
