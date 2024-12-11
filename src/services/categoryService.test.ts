import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Category from '../models/catergoryModel';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
} from '../services/categoryService';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {});
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Category.deleteMany();
});

describe('Category Service Tests', () => {
  /** Test Case: Create Category */
  it('should create a category without a parent', async () => {
    const category = await createCategory('Electronics');
    expect(category.name).toBe('Electronics');
    expect(category.parentId).toBeNull();
    expect(category.level).toBe(0);
  });

  it('should create a category with a parent', async () => {
    const parent = await createCategory('Electronics');
    const child = await createCategory('Mobiles', parent._id.toString());

    expect(child.name).toBe('Mobiles');
    expect(child.parentId!.toString()).toBe(parent._id.toString());
    expect(child.level).toBe(parent.level + 1);
  });

  /** Test Case: Update Category */
  it('should update an existing category', async () => {
    const category = await createCategory('Laptops');
    const updatedCategory = await updateCategory(
      category._id.toString(),
      'Computers',
    );
    expect(updatedCategory.name).toBe('Computers');
    expect(updatedCategory.path).toBe('/Computers');
  });

  it('should throw an error when updating a non-existent category', async () => {
    await expect(
      updateCategory(new mongoose.Types.ObjectId().toString(), 'Invalid'),
    ).rejects.toThrow('Category not found');
  });

  /** Test Case: Delete Category */
  it('should delete an existing category', async () => {
    const category = await createCategory('Cameras');
    await deleteCategory(category._id.toString());

    const deletedCategory = await Category.findById(category._id);
    expect(deletedCategory).toBeNull();
  });

  it('should throw an error when deleting a non-existent category', async () => {
    await expect(
      deleteCategory(new mongoose.Types.ObjectId().toString()),
    ).rejects.toThrow('Category not found');
  });

  /** Test Case: Get Category Tree */
  it('should retrieve a category tree', async () => {
    const parent = await createCategory('Home Appliances');
    await createCategory('Kitchen', parent._id.toString());
    await createCategory('Living Room', parent._id.toString());

    const tree = await getCategoryTree();
    expect(tree.length).toBe(1);
    expect(tree[0].name).toBe('Home Appliances');
    expect(tree[0].children.length).toBe(2);
  });
});
