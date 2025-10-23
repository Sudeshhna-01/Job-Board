const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');


  const company1 = await prisma.user.create({
    data: {
      name: 'TechCorp Inc.',
      email: 'admin@techcorp.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJapJMRnDv8uI/Q7Cy', // password: password
      role: 'COMPANY',
      company: {
        create: {
          name: 'TechCorp Inc.',
          description: 'A leading technology company specializing in software development and AI solutions.',
          website: 'https://techcorp.com'
        }
      }
    },
    include: { company: true }
  });

  const company2 = await prisma.user.create({
    data: {
      name: 'HealthPlus',
      email: 'hr@healthplus.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJapJMRnDv8uI/Q7Cy', // password: password
      role: 'COMPANY',
      company: {
        create: {
          name: 'HealthPlus',
          description: 'Healthcare technology company focused on improving patient care through innovative solutions.',
          website: 'https://healthplus.com'
        }
      }
    },
    include: { company: true }
  });


  const applicant = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJapJMRnDv8uI/Q7Cy', // password: password
      role: 'APPLICANT'
    }
  });


  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full-stack developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
        location: 'San Francisco',
        category: 'Technology',
        salary: '$120,000 - $150,000',
        type: 'Full-time',
        companyId: company1.company.id
      }
    }),
    prisma.job.create({
      data: {
        title: 'Frontend Developer',
        description: 'Join our frontend team to build beautiful and responsive user interfaces. Experience with React, TypeScript, and modern CSS is required.',
        location: 'Remote',
        category: 'Technology',
        salary: '$90,000 - $120,000',
        type: 'Full-time',
        companyId: company1.company.id
      }
    }),
    prisma.job.create({
      data: {
        title: 'Healthcare Data Analyst',
        description: 'Analyze healthcare data to improve patient outcomes. Experience with SQL, Python, and healthcare data is preferred.',
        location: 'New York',
        category: 'Healthcare',
        salary: '$80,000 - $100,000',
        type: 'Full-time',
        companyId: company2.company.id
      }
    }),
    prisma.job.create({
      data: {
        title: 'UX Designer',
        description: 'Design intuitive user experiences for our healthcare applications. Portfolio required.',
        location: 'Boston',
        category: 'Design',
        salary: '$70,000 - $90,000',
        type: 'Full-time',
        companyId: company2.company.id
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - ${company1.name} (Company)`);
  console.log(`   - ${company2.name} (Company)`);
  console.log(`   - ${applicant.name} (Applicant)`);
  console.log(`   - ${jobs.length} sample jobs`);
  console.log('');
  console.log('🔑 Test accounts:');
  console.log('   Company: admin@techcorp.com / password');
  console.log('   Company: hr@healthplus.com / password');
  console.log('   Applicant: john@example.com / password');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
