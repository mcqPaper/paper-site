import {Application, bind, BindingKey, BindingScope, CoreBindings, inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {logger} from '../config';
import {AuthorizationType, UserType} from '../models';
import {TimeConstants} from '../settings/constants';
import {TIME_CONVERSIONS} from '../settings/conversion';
var jwt = require('jsonwebtoken');

@bind({scope: BindingScope.TRANSIENT})
export class JsonWebTokenService {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) { }


  /**
   * Get both access token and refresh token
   * @param payload payload data (eg:user Id,user Type)
   * @returns whether isSuccess and tokens
   */
  async getTokens(payload: PayLoad): Promise<getTokensResponse> {

    let tokenExpiredTime: number = TimeConstants.TOKEN_EXPIRE * TIME_CONVERSIONS.HOURS_TO_SECONDS;
    let refreshTokenExpiredTime: number = TimeConstants.REFRESH_TOKEN_EXPIRE * TIME_CONVERSIONS.DAYS_TO_SECONDS;

    try {

      /**
      * Get token
    */
      let token: string = await this.generateWebToken(payload, tokenExpiredTime);

      /**
       * Get refresh token
       */
      let refreshToken: string = await this.generateWebToken(payload, refreshTokenExpiredTime);

      return {
        isSuccess: true,
        token: token,
        refreshToken: refreshToken
      }

    }

    catch (err) {
      logger.error(`Error occur when creating web token`, err);

      return {
        isSuccess: false
      }
    }

  }


  /**
   * Generate jwt web token
   * @param data payload data (eg:user Id,user Type)
   * @param expiredTime {number} token expired time in seconds
   * @returns JWT token
   */
  async generateWebToken(data: PayLoad, expiredTime: number): Promise<string> {

    let token: string = jwt.sign(data, process.env.PUBLIC_KEY, {expiresIn: expiredTime});

    return token;
  }


  /**
   * Verify JWT web token
   * @param token {string} JWT token
   * @param authorizationTypes authorization type(eg:Admin Only,Student Only etc.)
   * @returns whether isSuccess, userProfile
   */
  async verifyWebToken(token: string,
    authorizationTypes: AuthorizationType[] = [AuthorizationType.ALL_USERS])
    : Promise<PayLoad> {

    let forbiddenError = false;
    try {
      let decoded: VerifyToken = jwt.verify(token, process.env.PUBLIC_KEY);
      let userType: UserType = decoded.userType;

      let user: PayLoad = {
        id: decoded.id,
        userType: userType,
        name: decoded.name,
        email: decoded.email
      }

      let authorized: boolean = false;

      if (userType == UserType.ADMIN ||
        authorizationTypes.includes(AuthorizationType.ALL_USERS)) authorized = true;

      if (authorizationTypes.includes(AuthorizationType.ADMIN_ONLY)
        && userType == UserType.ADMIN) {
        authorized = true;
      }

      else if (authorizationTypes.includes(AuthorizationType.STUDENT_ONLY)
        && userType == UserType.STUDENT) {
        authorized = true;
      }

      else if (authorizationTypes.includes(AuthorizationType.EDITOR_ONLY)
        && userType == UserType.EDITOR) {
        authorized = true;
      }

      else if (authorizationTypes.includes(AuthorizationType.TEACHER_ONLY)
        && userType == UserType.TEACHER) {
        authorized = true;
      }

      //If user is authorized
      if (authorized) {

        return user;

      }

      else {
        forbiddenError = true
        throw new HttpErrors.Forbidden(WebTokenError.UNAUTHORIZED);

      }


    }

    catch (err: any) {
      if (forbiddenError) throw new HttpErrors.Forbidden(WebTokenError.UNAUTHORIZED);
      throw new HttpErrors.Unauthorized(WebTokenError.EXPIRED)
    }
  }


}
export const JSON_WEB_TOKEN_SERVICE = BindingKey.create<JsonWebTokenService>('service.jsonWebToken');

export interface PayLoad {
  id: string;
  userType: UserType;
  name: string;
  email: string;
}



export interface Error {
  name: string;
  message: string;
}

export interface getTokensResponse {
  isSuccess: boolean;
  token?: string;
  refreshToken?: string;
}

export interface VerifyToken extends PayLoad {
  iat: number;
  exp: number;
}

export enum WebTokenError {
  EXPIRED = "jwt expired",
  UNAUTHORIZED = "Unauthorized access"
}


