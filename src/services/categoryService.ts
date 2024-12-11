import mongoose from 'mongoose';
import Category from '../models/catergoryModel';
import logger from '../config/logger';

export const createCategory = async (name: string, parentId?: string) => {
  try {
    logger.info(`Creating category: ${name}`);
    const category = new Category({ name, parentId });
    await category.save();
    logger.info(`Category created: ${category._id}`);
    return category;
  } catch (error) {
    logger.error(`Error creating category: ${(error as Error).message}`);
    throw error;
  }
};

export const updateCategory = async (
  id: string,
  name: string,
  parentId?: string,
) => {
  try {
    const category = await Category.findById(id);
    if (!category) throw new Error('Category not found');

    category.name = name;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) throw new Error('Parent category not found');
      category.parentId = new mongoose.Types.ObjectId(parentId);
      category.path = `${parent.path}/${name}`;
      category.level = parent.level + 1;
    } else {
      category.parentId = null;
      category.path = `/${name}`;
      category.level = 0;
    }
    await category.save();
    logger.info(`Category updated: ${category._id}`);
    return category;
  } catch (error) {
    logger.error(`Error updating category: ${(error as Error).message}`);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const category = await Category.findById(id);
    if (!category) throw new Error('Category not found');
    await category.deleteOne();
    logger.info(`Category deleted: ${category._id}`);
  } catch (error) {
    logger.error(`Error deleting category: ${(error as Error).message}`);
    throw error;
  }
};

export const getCategoryTree = async (): Promise<any[]> => {
  try {
    const categories = await Category.find();
    const buildTree = (parentId: mongoose.Types.ObjectId | null): any[] => {
      return categories
        .filter((cat) => String(cat.parentId) === String(parentId))
        .map((cat): any => ({
          id: cat._id,
          name: cat.name,
          children: buildTree(cat._id as mongoose.Types.ObjectId),
        }));
    };
    const tree = buildTree(null);
    logger.info('Category tree retrieved');
    return tree;
  } catch (error) {
    logger.error(`Error retrieving category tree: ${(error as Error).message}`);
    throw error;
  }
};
