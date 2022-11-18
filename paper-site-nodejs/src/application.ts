// IMPORTS for JWT Authentication -------------
import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  RefreshTokenServiceBindings, UserServiceBindings
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MongoDataSource} from './datasources';
import {MySequence} from './sequence';
import {JsonWebTokenService} from './services';

// -------------
export {ApplicationConfig};

export class DeliveryServerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);



    // this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to('259200s');

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    //For JWT Authentication
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasources
    this.dataSource(MongoDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.dataSource(
      MongoDataSource,
      RefreshTokenServiceBindings.DATASOURCE_NAME,
    );

    this.bind('service.jsonWebToken').toClass(JsonWebTokenService);


    //Bind custom user-repo


    this.bind(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN).to('2592000');
  }
}
