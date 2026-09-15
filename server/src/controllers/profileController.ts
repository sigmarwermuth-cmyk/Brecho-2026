import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ProfileService } from '../services/profileService';

export const ProfileController = {
  // Chamado pelo frontend logo após signUp/signIn no Supabase, pra criar
  // ou atualizar a linha correspondente na tabela `users` do MySQL
  async sync(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, phone, address } = req.body;

      const profile = await ProfileService.upsert({
        id: req.userId!,
        email: req.userEmail!,
        name: name || req.userEmail!.split('@')[0],
        phone,
        address
      });

      res.json({ message: 'Perfil sincronizado com sucesso!', user: profile });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await ProfileService.findById(req.userId!);
      if (!profile) {
        return res.status(404).json({ error: 'Perfil não encontrado. Chame /api/auth/sync primeiro.' });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
