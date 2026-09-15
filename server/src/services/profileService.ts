import db from '../config/database';

export interface UserProfile {
  id: string; // UUID do Supabase Auth
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const ProfileService = {
  async findById(id: string) {
    return db('users').where({ id }).first();
  },

  async upsert(profile: { id: string; email: string; name: string; phone?: string; address?: string }) {
    const existing = await this.findById(profile.id);

    if (existing) {
      await db('users')
        .where({ id: profile.id })
        .update({
          name: profile.name,
          email: profile.email,
          phone: profile.phone ?? existing.phone,
          address: profile.address ?? existing.address
        });
    } else {
      await db('users').insert({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        address: profile.address || null
      });
    }

    return this.findById(profile.id);
  }
};
