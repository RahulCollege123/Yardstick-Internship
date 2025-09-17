import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const enforceTenantIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Add tenant ID to the request for use in routes
  req.body.tenantId = req.user.tenantId;
  
  next();
};
