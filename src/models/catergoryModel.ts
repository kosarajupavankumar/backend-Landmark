import mongoose, { Schema, Document } from 'mongoose';

// Interface for the category schema
export interface ICategory extends Document {
  name: string;
  parentId?: mongoose.Types.ObjectId | null;
  children: mongoose.Types.ObjectId[];
  path: string; // Full path e.g., '/Women/Clothing/Dresses'
  level: number; // Depth in hierarchy (0 for root categories)
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    path: { type: String, required: false },
    level: { type: Number, required: false },
  },
  { timestamps: true },
);

// Pre-save middleware: Automatically calculate `path` and `level`
CategorySchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isModified('parentId')) {
    if (this.parentId) {
      const parentCategory = await mongoose
        .model<ICategory>('Category')
        .findById(this.parentId);
      if (parentCategory) {
        this.path = `${parentCategory.path}/${this.name}`;
        this.level = parentCategory.level + 1;
      } else {
        throw new Error('Parent category not found.');
      }
    } else {
      this.path = `/${this.name}`;
      this.level = 0;
    }
  }
  next();
});

// Pre-delete middleware: Cascade delete children
CategorySchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const deleteChildren = async (parentId: mongoose.Types.ObjectId) => {
      const children = await mongoose
        .model<ICategory>('Category')
        .find({ parentId });
      for (const child of children) {
        await deleteChildren(child._id);
        await child.deleteOne();
      }
    };
    await deleteChildren(this._id);
    next();
  },
);

export default mongoose.model<ICategory>('Category', CategorySchema);
