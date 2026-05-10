import { User } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Will refine this once User model is built
    }
  }
}

export {};
