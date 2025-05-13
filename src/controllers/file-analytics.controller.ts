// src/controllers/file-analytics.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/file-analytics.service';
import { isValidToken } from '../Middilewares/auth.middleware';

const router = Router();

// POST /analytics/create
router.post('/analytics/create', isValidToken, async (req: Request, res: Response) => {
  const { fileId } = req.body;
  const userId = req.body.user?.id;

  if (!fileId || !userId) {
    return res.status(400).json({ message: 'fileId and userId are required' });
  }

  try {
    const result = await analyticsService.createOrUpdateDailyAnalytics(fileId, userId);
    res.json({ analytics: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /analytics/daily?fileId=...
router.get('/analytics/daily', isValidToken, async (req: Request, res: Response) => {
  const { fileId, date } = req.query;
  const userId = req.body.user?.id;

  if (!fileId || !userId || !date) {
    return res.status(400).json({ message: 'fileId, userId, and date are required' });
  }

  try {
    const dateObj = new Date(date as string);
    const result = await analyticsService.getAnalyticsForDate(fileId as string, userId, dateObj);
    res.json({ analytics: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/analytics/user/daily', isValidToken, async (req: Request, res: Response) => {
  const { date } = req.body;
  const userId = req.body.user?.id;
//   const timeZone = req.query.timezone || 'UTC';

  if (!date || !userId) {
    return res.status(400).json({ message: 'date is required' });
  }

  try {
    // const dateObj = new Date(date as string);
    const result = await analyticsService.getUserDailyTotals(userId, date);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics/user/monthly', isValidToken, async (req: Request, res: Response) => {
  const { month } = req.query;
  const userId = req.body.user?.id;

  if (!month || !userId) {
    return res.status(400).json({ message: 'month is required' });
  }

  try {
    const date = new Date(month as string);
    const result = await analyticsService.getUserMonthlyAnalytics(userId, date);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics/user/monthly-totals',isValidToken, async (req, res) => {
  try {
    const userId = req.body.user.id
    const monthParam = req.query.month as string;

    if (!userId || !monthParam) {
      return res.status(400).json({ error: 'Missing userId or month query param' });
    }

    const month = new Date(`${monthParam}-01`);
    if (isNaN(month.getTime())) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const result = await analyticsService.getUserMonthlyTotals(userId, month);
    return res.json(result);
  } catch (error) {
    console.error('Error in monthly totals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
