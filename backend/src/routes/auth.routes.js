const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyDescription, website } = req.body;


    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'APPLICANT'
      }
    });


    if (role === 'COMPANY' && companyName) {
      await prisma.company.create({
        data: {
          name: companyName,
          description: companyDescription || '',
          website: website || '',
          userId: user.id
        }
      });
    }


    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;


    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Invalid account type' });
    }


    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
