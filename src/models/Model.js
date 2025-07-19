import mongoose from 'mongoose';

const ModelSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
}, {
  timestamps: true,
});

// Optional: index to make querying by userID faster
ModelSchema.index({ userID: 1 });

export default mongoose.models.Model || mongoose.model('Model', ModelSchema);
