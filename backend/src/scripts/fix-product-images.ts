import { connectDatabase } from '../config/database';
import { Product } from '../models/Product';
import { sampleProducts } from './sampleProducts';

async function fixProductImages() {
  await connectDatabase();

  let updated = 0;

  for (const sample of sampleProducts) {
    const result = await Product.updateOne({ name: sample.name }, { $set: { image: sample.image } });
    if (result.modifiedCount > 0) {
      updated += 1;
      console.log(`Updated image for: ${sample.name}`);
    }
  }

  const broken = await Product.updateMany(
    {
      $or: [
        { image: { $regex: '^/images/' } },
        { image: { $regex: '^https://images\\.unsplash\\.com/' } },
        { image: { $regex: '^https://picsum\\.photos/' } },
        { image: { $regex: '/photos/45202/' } },
        { image: { $regex: '/photos/143133/' } },
      ],
    },
    { $set: { image: sampleProducts[0].image } }
  );

  console.log(`Updated ${updated} seeded product image(s).`);
  console.log(`Fixed ${broken.modifiedCount} legacy broken image URL(s).`);

  process.exit(0);
}

fixProductImages().catch((error) => {
  console.error(error);
  process.exit(1);
});
