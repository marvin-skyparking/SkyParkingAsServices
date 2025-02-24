import { Request, Response } from 'express';
import { updateLotStatus } from '../services/location_lot.service';

export async function updateLot(req: Request, res: Response) {
  try {
    const { id, locationCode, action } = req.body;

    // Validate required fields
    if (!id || !locationCode || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (action !== 'in' && action !== 'out') {
      return res
        .status(400)
        .json({ error: "Invalid action. Use 'in' or 'out'." });
    }

    // Call the service function
    const result = await updateLotStatus(Number(id), locationCode, action);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
