import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {logger} from '../config';
require('dotenv').config();

logger.debug(`db host ${process.env.DB_HOST}, port: ${process.env.DB_PORT}`)
logger.debug(`db host ${process.env.DB_USER}, port: ${process.env.DB_NAME}`)
logger.debug(`${encodeURIComponent(process.env.DB_PASS ?? "dev63784_Quiz")}`)

const config = {
  name: 'mongo',
  connector: 'mongodb',
  // url: '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 47017,
  user: process.env.DB_USER || 'quiz_devuser',
  password: encodeURIComponent(process.env.DB_PASS ?? "dev63784_Quiz"),
  database: process.env.DB_NAME || 'quizDB',
  useNewUrlParser: false
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongo';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
