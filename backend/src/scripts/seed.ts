import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { hashPassword } from '../utils/password';
import { sampleProducts } from './sampleProducts';

async function seed() {
  await connectDatabase();

  const adminEmail = 'admin@foodorder.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: await hashPassword('admin123'),
      role: 'admin',
    });
    console.log('Admin created: admin@foodorder.com / admin123');
  }

  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(sampleProducts);
    console.log(`Seeded ${sampleProducts.length} products`);
  } else {
    console.log('Products already exist, skipping seed');
    console.log('Run "npm run seed:fix-images" to repair broken product image URLs');
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
