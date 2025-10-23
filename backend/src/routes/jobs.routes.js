const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();


router.get('/', async (req, res) => {
  try {
    const { search, location, category, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      AND: [
        search ? { title: { contains: search, mode: 'insensitive' } } : {},
        location ? { location: { contains: location, mode: 'insensitive' } } : {},
        category ? { category: { contains: category, mode: 'insensitive' } } : {}
      ]
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              website: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            website: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requireRole(['COMPANY']), async (req, res) => {
  try {
    const { title, description, location, category, salary, type } = req.body;

    if (!title || !description || !location || !category) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        category,
        salary,
        type,
        companyId: req.user.company.id
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            website: true
          }
        }
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/:id', authenticateToken, requireRole(['COMPANY']), async (req, res) => {
  try {
    const { title, description, location, category, salary, type } = req.body;
    const jobId = parseInt(req.params.id);

    
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: req.user.company.id
      }
    });

    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        description,
        location,
        category,
        salary,
        type
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            website: true
          }
        }
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/:id', authenticateToken, requireRole(['COMPANY']), async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);


    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: req.user.company.id
      }
    });

    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    await prisma.job.delete({
      where: { id: jobId }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
