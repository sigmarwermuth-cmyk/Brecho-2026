import { Router } from 'express';
import { Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { isAdmin } from '../middlewares/admin';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

router.delete('/users/:id', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // 1. Deletar o usuário da Auth do Supabase (Admin API)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error('Supabase Auth Error:', authError);
      throw new Error(`Supabase Auth Error: ${authError.message}`);
    }

    // O perfil na tabela public.profiles será deletado automaticamente
    // devido ao 'on delete cascade' que configuramos anteriormente.

    res.json({ message: 'Usuário removido com sucesso do sistema!' });
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: error.message || 'Erro interno ao remover usuário' });
  }
});

export default router;
