// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core'
import {repository} from '@loopback/repository'
import {get, param, post, requestBody} from '@loopback/rest'
import {logger} from '../config'
import {AuthorizationType, ProjectDetails} from '../models'
import {ProjectRepository} from '../repositories'
import {JsonWebTokenService, JSON_WEB_TOKEN_SERVICE} from '../services'

// import {inject} from '@loopback/core';


export class ProjectController {
  constructor(
    @repository(ProjectRepository)
    protected projectRepository: ProjectRepository,
    @inject(JSON_WEB_TOKEN_SERVICE)
    private jsonWebToken: JsonWebTokenService,
  ) { }

  @post('api/projects/create')
  async createProject(
    @param.header.string('Authorization') accessToken: string,
    @requestBody() projectDetails: ProjectDetails,
  ) {
    logger.debug(`project create  initiated for project Name: ${projectDetails.name}`)

    //let user = await this.jsonWebToken.verifyWebToken(accessToken, [AuthorizationType.ADMIN_ONLY]);

    return await this.projectRepository.create({
      name: projectDetails.name,
      results: projectDetails.results,
      createdAt: new Date(),
      //updatedAt: new Date(),
      //createdById: user.id,
      //createdBy: user.name
    })
  }



  @get('api/projects/list')
  async getList(
    @param.header.string('Authorization') accessToken: string,
  ) {
    logger.debug(`get project list`)

    await this.jsonWebToken.verifyWebToken(accessToken, [AuthorizationType.ADMIN_ONLY]);

    return await this.projectRepository.find({
      order: ['id DESC']
    })
  }



  @get('api/result/brief/list')
  async getResultList(
  ) {

    let results = await this.projectRepository.find({
      order: ['id DESC']
    })
    let returnList = []
    for (let obj of results) {
      let tempObject = {
        name: obj.name,
        correctCount: obj.results?.correctAnswers || 0,
        totalCount: obj.results?.totalQuestions || 0,
        percentage: `${(obj.results?.correctAnswers || 0) / (obj.results?.totalQuestions || 1) * 100}%`
      }
      returnList.push(tempObject)
    }

    returnList.sort((a, b) => b.correctCount - a.correctCount)
    return returnList
  }


  @get('api/result/all/list')
  async getAllResultList(
  ) {

    let results = await this.projectRepository.find({})

    return results
  }
}
