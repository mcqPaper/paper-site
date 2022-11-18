import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Paper, PaperRelations} from '../models';

export class PaperRepository extends DefaultCrudRepository<
  Paper,
  typeof Paper.prototype.id,
  PaperRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Paper, dataSource);
  }
}
