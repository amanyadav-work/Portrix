import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const SandboxSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    modelID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      required: false,
    },
    github_url: {
      type: String,
      required: true
    },
    zipData: {
      type: Buffer,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      default: () => nanoid(10),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Sandbox || mongoose.model('Sandbox', SandboxSchema);
