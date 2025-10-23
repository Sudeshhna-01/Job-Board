const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestApplications() {
  console.log('🌱 Adding test applications...');

  try {

    const company = await prisma.company.findFirst({
      include: {
        jobs: true
      }
    });

    if (!company || company.jobs.length === 0) {
      console.log('❌ No company or jobs found. Please run the seed script first.');
      return;
    }


    const job = company.jobs[0];


    let applicant = await prisma.user.findFirst({
      where: { email: 'test.applicant@example.com' }
    });

    if (!applicant) {
      applicant = await prisma.user.create({
        data: {
          name: 'Test Applicant',
          email: 'test.applicant@example.com',
          password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJapJMRnDv8uI/Q7Cy', // password: password
          role: 'APPLICANT'
        }
      });
    }


    const applications = await Promise.all([
      prisma.application.create({
        data: {
          resumeUrl: '/uploads/sample-resume.pdf',
          coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Full Stack Developer position at TechCorp Inc. With over 5 years of experience in full-stack development, I am confident that I would be a valuable addition to your team.\n\nMy experience includes:\n- React, Node.js, and TypeScript\n- Database design and optimization\n- Cloud platforms (AWS, Azure)\n- Agile development methodologies\n\nI am excited about the opportunity to contribute to your innovative projects and grow with your company.\n\nBest regards,\nTest Applicant',
          status: 'PENDING',
          jobId: job.id,
          applicantId: applicant.id
        }
      }),
      prisma.application.create({
        data: {
          resumeUrl: '/uploads/sample-resume-2.pdf',
          coverLetter: 'Hello,\n\nI am very interested in this position and believe my skills align perfectly with your requirements. I have extensive experience in modern web technologies and am passionate about creating high-quality software solutions.\n\nThank you for considering my application.\n\nSincerely,\nTest Applicant',
          status: 'REVIEWED',
          jobId: job.id,
          applicantId: applicant.id
        }
      })
    ]);

    console.log('✅ Test applications created successfully!');
    console.log(`📊 Created ${applications.length} test applications for job: ${job.title}`);
    console.log(`🏢 Company: ${company.name}`);
    console.log(`👤 Applicant: ${applicant.name}`);
    console.log('');
    console.log('🔑 Test applicant account:');
    console.log('   Email: test.applicant@example.com');
    console.log('   Password: password');

  } catch (error) {
    console.error('❌ Error creating test applications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestApplications();
