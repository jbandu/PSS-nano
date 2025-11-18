import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@airline-ops/shared-utils';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message;
        return acc;
      }, {} as Record<string, string>);

      throw new ValidationError('Validation failed', { errors: details });
    }

    next();
  };
};
