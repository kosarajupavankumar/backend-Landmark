import { Request, Response } from 'express';
import * as CategoryService from '../services/categoryService';
import logger from '../config/logger';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;
    const category = await CategoryService.createCategory(name, parentId);
    logger.info('Category created successfully', { name, parentId });
    res
      .status(201)
      .json({ success: true, message: 'Category created', category });
  } catch (error) {
    logger.error('Error creating category', {
      error: (error as Error).message,
    });
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const category = await CategoryService.updateCategory(id, name, parentId);
    logger.info('Category updated successfully', { id, name, parentId });
    res
      .status(200)
      .json({ success: true, message: 'Category updated', category });
  } catch (error) {
    logger.error('Error updating category', {
      error: (error as Error).message,
    });
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    logger.info('Category deleted successfully', { id });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    logger.error('Error deleting category', {
      error: (error as Error).message,
    });
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const tree = await CategoryService.getCategoryTree();
    logger.info('Category tree retrieved successfully');
    res.status(200).json({ success: true, tree });
  } catch (error) {
    logger.error('Error retrieving category tree', {
      error: (error as Error).message,
    });
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
