import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', req.userId!)
      .single();

    if (error || !data?.is_admin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
