const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});


router.post('/apply/:jobId', authenticateToken, requireRole(['APPLICANT']), upload.single('resume'), async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const { coverLetter } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }


    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }


    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: req.user.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await prisma.application.create({
      data: {
        resumeUrl: `/uploads/${req.file.filename}`,
        coverLetter: coverLetter || '',
        jobId,
        applicantId: req.user.id
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/my-applications', authenticateToken, requireRole(['APPLICANT']), async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { applicantId: req.user.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                website: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get applications for company's jobs (Company only)
router.get('/company-applications', authenticateToken, requireRole(['COMPANY']), async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        job: {
          companyId: req.user.company.id
        }
      },
      include: {
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/:id/status', authenticateToken, requireRole(['COMPANY']), async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }


    const existingApplication = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId: req.user.company.id
        }
      }
    });

    if (!existingApplication) {
      return res.status(404).json({ message: 'Application not found or access denied' });
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: {
          select: {
            title: true
          }
        },
        applicant: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(application);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
