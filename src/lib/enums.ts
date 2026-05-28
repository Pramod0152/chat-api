export enum EnvVariableType {
  PROD = 'prod',
  UAT = 'uat',
  QA = 'qa',
  DEV = 'dev',
  LOC = 'local',
}

export enum SuccessMessageType {
  DefaultSuccessMessage = 'Success',
  LoginSuccessMessage = 'Login Successfully',
  RegisterSuccessMessage = 'User Registered Successfully',
  RefreshTokenSuccessMessage = 'Refresh Token Successfully',
}

export enum ErrorMessageType {
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  NotFound = 'Not Found',
  BadRequest = 'Bad Request',
  InternalServerError = 'Internal Server Error',
  DefaultErrorMessage = 'Something went wrong',
  UserNotFound = 'User not found',
  PasswordIncorrect = 'Password is incorrect',
  EmailRequired = 'Email is required',
  EmailAlreadyExists = 'Email already exists',
  UsernameAlreadyExists = 'Username already exists',
  PrivateConversationParticipantLimit = 'Private conversations can only have one additional participant',
}

export enum ThrottlerConfig {
  GlobalThrottleTtl = 60,
  GlobalThrottleLimit = 2000,
}

export enum SeverityType {
  emerg = 0,
  alert = 1,
  crit = 2,
  error = 3,
  warning = 4,
  notice = 5,
  info = 6,
  debug = 7,
}

export enum ErrorCodeType {
  GeneralException = 'GENERAL_EXCEPTION',
}

export enum AuthVariable {
  SaltOrRounds = 10,
}

export enum ConversationType {
  Group = 'Group',
  Private = 'Private',
}

export enum MessageType {
  Text = 'Text',
}
