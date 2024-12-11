import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import CategoryModel, { ICategory } from '../models/catergoryModel';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Category Model', () => {
  let rootCategory: ICategory;
  let subCategory: ICategory;

  /** Create Category Tests */
  it('should create a root category', async () => {
    rootCategory = await CategoryModel.create({ name: 'Root Category' });

    expect(rootCategory.name).toBe('Root Category');
    expect(rootCategory.parentId).toBeNull();
    expect(rootCategory.level).toBe(0);
    expect(rootCategory.path).toBe('/Root Category');
  });

  it('should create a sub-category', async () => {
    subCategory = await CategoryModel.create({
      name: 'Sub Category',
      parentId: rootCategory._id,
    });

    expect(subCategory.name).toBe('Sub Category');
    expect(subCategory.parentId?.toString()).toBe(rootCategory._id.toString());
    expect(subCategory.level).toBe(1);
    expect(subCategory.path).toBe('/Root Category/Sub Category');
  });

  /** Validation Error Tests */
  it('should throw validation error if name is missing', async () => {
    await expect(CategoryModel.create({})).rejects.toThrow(
      'Category validation failed: name: Path `name` is required.',
    );
  });

  it('should throw an error if parent category does not exist', async () => {
    const invalidId = new mongoose.Types.ObjectId();

    await expect(
      CategoryModel.create({
        name: 'Invalid Sub Category',
        parentId: invalidId,
      }),
    ).rejects.toThrow('Parent category not found.');
  });

  /** Update Category Tests */
  it('should update a category name', async () => {
    subCategory.name = 'Updated Sub Category';
    await subCategory.save();

    expect(subCategory.name).toBe('Updated Sub Category');
    expect(subCategory.path).toBe('/Root Category/Updated Sub Category');
  });

  /** Delete Category Tests */
  it('should cascade delete sub-categories', async () => {
    await rootCategory.deleteOne();

    const deletedRoot = await CategoryModel.findById(rootCategory._id);
    const deletedSub = await CategoryModel.findById(subCategory._id);

    expect(deletedRoot).toBeNull();
    expect(deletedSub).toBeNull();
  });
});
