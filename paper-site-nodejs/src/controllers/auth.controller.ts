import {inject} from '@loopback/core';
import {DataObject, repository} from '@loopback/repository';
import {param, post, requestBody} from '@loopback/rest';
import {logger} from '../config';
import warnMessage from "../messages/warning-messages.json";
import {User, UserType} from '../models';
import {UserRepository} from '../repositories';
import {getTokensResponse, JsonWebTokenService, JSON_WEB_TOKEN_SERVICE, PayLoad} from '../services';
import {password_length as passwordLength} from '../settings/constants';
import {hashPassword} from "../settings/tools";
const BASE_URL = "/api/users";

export class AuthController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(JSON_WEB_TOKEN_SERVICE) private jsonWebToken: JsonWebTokenService,

  ) { }


  @post(BASE_URL + '/signup')
  async userSignUp(
    @requestBody() personalDetails: SignUpDetails,
  )
    : Promise<AuthenticationResponse> {

    logger.info(`user sign up`);

    /**
     * Verify credentials
     */
    // let credentialVerify = await this.validateUserCredentials(personalDetails);

    // if (!credentialVerify.isSuccess) {

    //   return credentialVerify;
    // }

    let existingUser = await this.userRepository.
      findOne({where: {email: personalDetails.email}});

    //Check if email is already used
    if (!existingUser) {
      logger.debug(personalDetails)

      /**
       * hashed the password user entered
       */
      let encryptedPassword: string = hashPassword(personalDetails.password);
      let userType: UserType = UserType.STUDENT;

      let userData: DataObject<User> = {
        email: personalDetails.email,
        password: encryptedPassword,
        userType: userType,
        name: personalDetails.name
      }

      let userDetails = await this.userRepository.create(userData);

      let userProfile: SignUpProfile = {
        email: personalDetails.email,
        userId: userDetails.id,
        userType: userType,
        name: personalDetails.name
      }

      let data: PayLoad = {
        id: userDetails.id,
        userType: userType,
        name: personalDetails.name,
        email: personalDetails.email
      }

      /**
       * Generate access token and refresh token
       */
      let tokens = await this.jsonWebToken.getTokens(data);

      //if token generation is success
      if (tokens.isSuccess) {

        return {
          isSuccess: true,
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          userProfile: userProfile
        }

      }

      else {

        return {
          isSuccess: false,
          message: warnMessage.JWT_GENERATE_ERR
        }
      }

    }

    else {

      return {
        isSuccess: false,
        message: warnMessage.USED_EMAIL
      }

    }

  }

  @post(BASE_URL + '/login')
  async userLogin(
    @requestBody() personalDetails: LoginDetails,
  ): Promise<AuthenticationResponse> {


    let encryptedPassword: string = hashPassword(personalDetails.password);

    let existingUser = await this.userRepository.
      findOne({where: {email: personalDetails.email}});

    if (existingUser) {

      if (existingUser.password == encryptedPassword) {

        let data: PayLoad = {
          id: existingUser.id,
          userType: existingUser.userType,
          name: existingUser.name,
          email: personalDetails.email
        }

        /**
        * Generate access token and refresh token
        */
        let tokens = await this.jsonWebToken.getTokens(data);

        //if token generation is success
        if (tokens.isSuccess) {

          let userProfile: SignUpProfile = {
            email: existingUser.email,
            userId: existingUser.id,
            userType: existingUser.userType,
            name: existingUser.name

          }

          return {
            isSuccess: true,
            token: tokens.token,
            refreshToken: tokens.refreshToken,
            userProfile: userProfile
          }

        } else {

          return {
            isSuccess: false,
            message: warnMessage.JWT_GENERATE_ERR
          }
        }


      }

      else {

        return {
          isSuccess: false,
          message: warnMessage.INVALID_LOGIN
        }

      }
    }

    else {

      return {
        isSuccess: false,
        message: warnMessage.INVALID_LOGIN
      }
    }

  }

  @post(BASE_URL + '/test')
  async test(
    @param.header.string('Authorization') accessToken: string,
    @requestBody() test: {name: string},
  ) {

    await this.jsonWebToken.verifyWebToken(accessToken);

    return {
      name: test.name
    }
  }


  @post(BASE_URL + '/refreshToken')
  async refreshToken(
    @requestBody() refreshToken: {token: string},
  ): Promise<RefreshTokenResponse> {

    logger.info(`Refresh token service`);

    /**
     *  Verify web token
     */
    let userDetails = await this.jsonWebToken.verifyWebToken(refreshToken.token);

    /**
    * Generate access token and refresh token
   */
    let tokens = await this.jsonWebToken.getTokens(userDetails);

    if (tokens.isSuccess) {

      return {
        isSuccess: true,
        token: tokens.token,
        refreshToken: tokens.refreshToken
      }

    }
    else {

      return {
        isSuccess: false,
        message: warnMessage.JWT_GENERATE_ERR
      }

    }

  }


  /**
   * Verify user credentials
   * @param credentials email,password
   * @returns whether success
   */
  async validateUserCredentials(credentials: SignUpDetails): Promise<CredentialVerify> {

    let email: string = credentials.email;
    let password: string = credentials.password;

    /**
     * verify password
     */
    let validatePasswordResponse = await this.validatePassword(password);

    /**
     * verify entered email
     */
    let validateEmailResponse = await this.validateEmail(email);


    if (!validateEmailResponse.isSuccess) {

      return {
        isSuccess: false,
        message: warnMessage.INVALID_EMAIL
      }

    }

    else if (credentials.password.length < passwordLength) {

      return {
        isSuccess: false,
        message: warnMessage.TOO_SHORT_PASSWORD
      }

    }

    else if (!validatePasswordResponse.isSuccess) {

      return {
        isSuccess: false,
        message: validatePasswordResponse.message
      }

    }

    else {

      return {
        isSuccess: true
      }
    }
  }


  /**
   * validate entered email
   * @param email{string} user entered Email
   * @returns whether is success
   */
  async validateEmail(email: string): Promise<CredentialVerify> {

    let atCharacter: boolean = false;
    let dotCharacter: boolean = false;

    //Validate email
    for (let index = 0; index < email.length; index++) {

      if (email[index] == "@") atCharacter = true;

      else if (email[index] == ".") dotCharacter = true;
    }

    if (!atCharacter || !dotCharacter) {

      return {
        isSuccess: false,
        message: warnMessage.INVALID_EMAIL
      }
    }
    else {

      return {
        isSuccess: true
      }
    }

  }


  /**
   * Verify password
   * @param password {string} user entered password
   * @returns whether is success
   */
  async validatePassword(password: string): Promise<CredentialVerify> {

    let numberArray: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    let specialCharacter: string[] = ["!", "@", "#", "$"];

    let passwordVerifyObj = {
      containNumber: false,
      containLowerCase: false,
      containUpperCase: false,
      containSpecialCharacter: false,
    }

    let suffix: string = '';
    let notAcceptableTimes: number = 0;

    //Verify password in right format
    for (let index = 0; index < password.length; index++) {

      if (numberArray.includes(password[index]) &&
        !passwordVerifyObj.containNumber) passwordVerifyObj.containNumber = true;

      else if (specialCharacter.includes(password[index]) &&
        !passwordVerifyObj.containSpecialCharacter) passwordVerifyObj.containSpecialCharacter = true;

      else if (password[index].match(/[a-z]/i)) {

        if (password[index] == password[index].toLowerCase()) passwordVerifyObj.containLowerCase = true;

        else passwordVerifyObj.containUpperCase = true;

      }
    }


    for (const [key, value] of Object.entries(passwordVerifyObj)) {

      if (value == false) notAcceptableTimes += 1;
    }

    let iteration: number = 1;
    let messageGeneratedTimes: number = 0;

    for (const [key, value] of Object.entries(passwordVerifyObj)) {

      if (value == false) {
        messageGeneratedTimes += 1;

        const message = Object.values(warnMessage.INVALID_PASSWORD)[iteration];

        if (suffix.length == 0) suffix += message;

        else if (messageGeneratedTimes !== notAcceptableTimes) suffix += `, ${message}`;

        else suffix += ` and ${message}`;;
      }

      iteration += 1;
    }

    if (suffix.length > 0) {

      return {
        isSuccess: false,
        message: warnMessage.INVALID_PASSWORD.PREFIX.concat(suffix)
      }
    }

    else {

      return {
        isSuccess: true
      }
    }

  }
}



export interface SignUpDetails {
  email: string;
  password: string;
  name: string;
}

export interface LoginDetails extends Omit<SignUpDetails, "name"> {

}

export interface AuthenticationResponse {
  isSuccess: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  userProfile?: SignUpProfile;
}

export interface SignUpProfile {
  email: string;
  userType: UserType;
  userId: string;
  name: string;
}

export interface RefreshTokenResponse extends getTokensResponse {
  message?: string;
}

export interface CredentialVerify {
  isSuccess: boolean;
  message?: string;
}
