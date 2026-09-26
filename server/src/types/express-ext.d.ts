declare global {
  namespace Express {
    interface Request {
      /** Set by `protect` from the verified access token. */
      userId?: string;
      /** Set by `requireRole` (RBAC) after loading the user. */
      user?: any;
    }
  }
}

export {};
