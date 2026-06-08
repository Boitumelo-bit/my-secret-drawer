const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedReviews() {
  console.log('Seeding reviews...');

  // Get existing customers and products
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    take: 3
  });
  
  const products = await prisma.product.findMany({
    take: 5
  });

  if (customers.length === 0 || products.length === 0) {
    console.log('No customers or products found. Please create them first.');
    return;
  }

  const sampleReviews = [
    {
      rating: 5,
      title: 'Absolutely stunning!',
      comment: 'This dress is even more beautiful in person. The material is high quality and the fit is perfect. Highly recommend!',
      isApproved: true
    },
    {
      rating: 4,
      title: 'Great quality',
      comment: 'Very nice dress, comfortable and elegant. The color is exactly as shown.',
      isApproved: true
    },
    {
      rating: 5,
      title: 'Perfect for special occasions',
      comment: 'Wore this to a wedding and got so many compliments! Worth every penny.',
      isApproved: true
    },
    {
      rating: 3,
      title: 'Good but runs small',
      comment: 'Quality is good but size runs small. I would recommend sizing up.',
      isApproved: true
    },
    {
      rating: 5,
      title: 'Love it!',
      comment: 'Fast shipping, great packaging, beautiful dress. Will buy again!',
      isApproved: true
    }
  ];

  for (const product of products) {
    for (let i = 0; i < Math.min(2, sampleReviews.length); i++) {
      const review = sampleReviews[i];
      const customer = customers[i % customers.length];
      
      await prisma.review.upsert({
        where: {
          userId_productId: {
            userId: customer.id,
            productId: product.id
          }
        },
        update: {},
        create: {
          userId: customer.id,
          productId: product.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isApproved: review.isApproved
        }
      });
    }
  }

  console.log('Reviews seeded successfully!');
}

seedReviews()
  .catch(e => {
    console.error('Error seeding reviews:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });