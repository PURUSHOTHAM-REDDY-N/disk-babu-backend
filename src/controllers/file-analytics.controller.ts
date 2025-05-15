// src/controllers/file-analytics.controller.ts
import e, { Router, Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/file-analytics.service';
import { isValidToken } from '../Middilewares/auth.middleware';
import moment from 'moment';

const router = Router();

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
router.get('/analytics/getAnalyticsByDateAndFile', isValidToken, async (req: Request, res: Response) => {
  const { fileId, date } = req.body;
  const userId = req.body.user?.id;

  if (!fileId || !userId || !date) {
    return res.status(400).json({ message: 'fileId, userId, and date are required' });
  }

  try {
    const result = await analyticsService.getAnalyticsByDateAndFile(fileId as string, userId, date);
    res.json({ analytics: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/analytics/getUserAnalyticsByDate', isValidToken, async (req: Request, res: Response) => {
  const { date } = req.body;
  const userId = req.body.user?.id;

  if (!date || !userId) {
    return res.status(400).json({ message: 'date is required' });
  }

  try {
    const result = await analyticsService.getUserAnalyticsByDate(userId, date);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics/getUserAnalyticsByMonth', isValidToken, async (req: Request, res: Response) => {
  const { date } = req.body;
  const userId = req.body.user?.id;

  if (!date) {
    return res.status(400).json({ message: 'date is required' });
  }

  try {
    const result = await analyticsService.getUserAnalyticsByMonth(userId, date);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/analytics/getUserMonthlyAnalyticsTotals',isValidToken, async (req, res) => {
  try {
    const userId = req.body.user.id
    const date = req.body.date
    if (!userId || !date) {
      return res.status(400).json({ error: 'Missing userId or month query param' });
    }


    const result = await analyticsService.getUserMonthlyAnalyticsTotals(userId, date);
    return res.json(result);
  } catch (error) {
    console.error('Error in monthly totals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
