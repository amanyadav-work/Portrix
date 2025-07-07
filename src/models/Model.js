import mongoose from 'mongoose';

const ModelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sandboxId: { type: String, required: true },
  url: { type: String, required: true },
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ModelSchema.index({ userId: 1, sandboxId: 1 }, { unique: true }); // one model per sandbox

export default mongoose.models.Model || mongoose.model('Model', ModelSchema);
