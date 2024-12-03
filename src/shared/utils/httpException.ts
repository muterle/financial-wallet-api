import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export const returnException = (
  logger: Logger,
  error: any,
  httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
) => {
  let message = '';
  if (error.parent) {
    message = error.parent.sqlMessage;
  } else {
    message = error.message;
  }

  logger.error(message, error);

  throw new HttpException(message, httpStatus);
};
