import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { AuthenticatedRequest } from '../middlewares/auth';

export const ProductController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const product = await ProductService.create({
        ...req.body,
        user_id: req.userId // vem do token verificado pelo requireAuth, não do body
      });
      res.status(201).json({ message: 'Produto postado com sucesso!', productId: product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const products = await ProductService.getAll(req.query);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await ProductService.getById(parseInt(id, 10));
      if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
