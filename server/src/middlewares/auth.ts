import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Em vez de usar jwt.verify localmente, perguntamos ao Supabase se o token é válido.
    // Isso é a forma mais segura e confiável de validar tokens do Supabase no servidor.
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error(`[Auth Error] Token validation failed:`, error?.message || 'User not found');
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Erro interno na autenticação' });
  }
}
