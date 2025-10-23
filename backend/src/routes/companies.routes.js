const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();


router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            jobs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            location: true,
            category: true,
            type: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/profile', authenticateToken, requireRole(['COMPANY']), async (req, res) => {
  try {
    const { name, description, website } = req.body;

    const company = await prisma.company.update({
      where: { id: req.user.company.id },
      data: {
        name,
        description,
        website
      }
    });

    res.json(company);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/dashboard/stats', authenticateToken, requireRole(['COMPANY']), async (req, res) => {
  try {
    const companyId = req.user.company.id;

    const [totalJobs, totalApplications, recentApplications] = await Promise.all([
      prisma.job.count({
        where: { companyId }
      }),
      prisma.application.count({
        where: {
          job: { companyId }
        }
      }),
      prisma.application.findMany({
        where: {
          job: { companyId }
        },
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
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      totalJobs,
      totalApplications,
      recentApplications
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
