import request from 'supertest';
import express from 'express';
import * as CategoryService from '../services/categoryService';
import * as CategoryController from '../controllers/catergoryController';
import logger from '../config/logger';

const app = express();
app.use(express.json());
app.post('/api/categories', CategoryController.createCategory);
app.put('/api/categories/:id', CategoryController.updateCategory);
app.delete('/api/categories/:id', CategoryController.deleteCategory);
app.get('/api/categories/tree', CategoryController.getCategoryTree);

jest.mock('../services/categoryService');
jest.mock('../config/logger');

describe('Category Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** Create Category Test */
  it('should create a category successfully', async () => {
    const mockCategory = { _id: '1', name: 'Test Category' };

    (CategoryService.createCategory as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const response = await request(app)
      .post('/api/categories')
      .send({ name: 'Test Category' })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Category created');
    expect(response.body.category).toEqual(mockCategory);
    expect(logger.info).toHaveBeenCalledWith('Category created successfully', {
      name: 'Test Category',
      parentId: undefined,
    });
  });

  it('should fail to create a category on service error', async () => {
    const errorMessage = 'Category creation failed';
    (CategoryService.createCategory as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const response = await request(app)
      .post('/api/categories')
      .send({ name: 'Test Category' })
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(errorMessage);
    expect(logger.error).toHaveBeenCalledWith('Error creating category', {
      error: errorMessage,
    });
  });

  /** Update Category Test */
  it('should update a category successfully', async () => {
    const mockCategory = { _id: '1', name: 'Updated Category' };

    (CategoryService.updateCategory as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const response = await request(app)
      .put('/api/categories/1')
      .send({ name: 'Updated Category' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Category updated');
    expect(response.body.category).toEqual(mockCategory);
    expect(logger.info).toHaveBeenCalledWith('Category updated successfully', {
      id: '1',
      name: 'Updated Category',
      parentId: undefined,
    });
  });

  it('should fail to update a category on service error', async () => {
    const errorMessage = 'Category update failed';

    (CategoryService.updateCategory as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const response = await request(app)
      .put('/api/categories/1')
      .send({ name: 'Updated Category' })
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(errorMessage);
    expect(logger.error).toHaveBeenCalledWith('Error updating category', {
      error: errorMessage,
    });
  });

  /** Delete Category Test */
  it('should delete a category successfully', async () => {
    (CategoryService.deleteCategory as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete('/api/categories/1').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Category deleted');
    expect(logger.info).toHaveBeenCalledWith('Category deleted successfully', {
      id: '1',
    });
  });

  it('should fail to delete a category on service error', async () => {
    const errorMessage = 'Category deletion failed';

    (CategoryService.deleteCategory as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const response = await request(app).delete('/api/categories/1').expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(errorMessage);
    expect(logger.error).toHaveBeenCalledWith('Error deleting category', {
      error: errorMessage,
    });
  });

  /** Get Category Tree Test */
  it('should retrieve the category tree successfully', async () => {
    const mockTree = [
      { _id: '1', name: 'Root', children: [{ _id: '2', name: 'Child' }] },
    ];

    (CategoryService.getCategoryTree as jest.Mock).mockResolvedValue(mockTree);

    const response = await request(app).get('/api/categories/tree').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.tree).toEqual(mockTree);
    expect(logger.info).toHaveBeenCalledWith(
      'Category tree retrieved successfully',
    );
  });

  it('should fail to retrieve the category tree on service error', async () => {
    const errorMessage = 'Failed to retrieve category tree';

    (CategoryService.getCategoryTree as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const response = await request(app).get('/api/categories/tree').expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(errorMessage);
    expect(logger.error).toHaveBeenCalledWith(
      'Error retrieving category tree',
      { error: errorMessage },
    );
  });
});
