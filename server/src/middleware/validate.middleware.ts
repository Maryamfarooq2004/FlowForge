import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Terminal validation middleware. Place AFTER a set of express-validator
 * checks; it collects any errors and returns the app-standard envelope
 * ({ success, code, message, errors }) with HTTP 422, otherwise calls next().
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.type === 'field' ? e.path : undefined,
      message: e.msg as string,
    }));
    res.status(422).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      errors,
    });
    return;
  }
  next();
};

/**
 * Convenience wrapper: run a list of validation chains, then `validate`.
 * Usage: router.post('/x', ...validateBody([body('email').isEmail()]), handler)
 */
export const validateBody = (chains: ValidationChain[]) => [...chains, validate];
