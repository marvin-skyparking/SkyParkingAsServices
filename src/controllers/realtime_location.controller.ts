import { Request, Response } from 'express';
import { updateLotStatus } from '../services/location_lot.service';
import { getLocationsByCode } from '../services/location_area.service';

export async function updateLot(req: Request, res: Response): Promise<any> {
  try {
    const { locationCode, lot_name, action } = req.body;

    // Validate required fields
    if (!lot_name || !locationCode || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (action !== 'IN' && action !== 'OUT') {
      return res
        .status(400)
        .json({ error: "Invalid action. Use 'IN' or 'OUT'." });
    }

    // Call the service function
    const result = await updateLotStatus(lot_name, locationCode, action);

    if ('responseStatus' in result) {
      return res.status(200).json(result);
    }

    const final_message = {
      responseStatus: 'SUCCESS',
      responseCode: '211000',
      responseMessage: `Success Update data ${action}`,
      data: {
        location_code: result.location_code,
        location_name: result.location_name,
        lot_name: result.lot_name,
        vehicle_type: result.vehicle_type,
        max_lot: result.max_lot,
        used_lot: result.used_lot,
        available_lot: result.available_lot
      }
    };
    return res.status(200).json(final_message);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getLocationByCodeController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { locationCode } = req.body;

    if (!locationCode) {
      return res.status(400).json({
        responseStatus: 'FAILED',
        ResponseCode: '400402',
        responseMessage: 'Bad Parameters, locationCode is required'
      });
    }

    const locations = await getLocationsByCode(locationCode);

    if (!locations || locations.length === 0) {
      return res.status(404).json({
        responseStatus: 'FAILED',
        ResponseCode: '404404',
        responseMessage: 'Location Service, Location Code not found'
      });
    }

    const formattedLocations = locations.map((location) => ({
      location_code: location.location_code,
      location_name: location.location_name,
      address: location.address,
      coordinate: location.coordinate,
      category: location.category,
      total_lot: location.total_lot,
      lots: location.lots.map(
        (lot: {
          location_name: string;
          lot_name: string;
          vehicle_type: string;
          max_lot: number;
          used_lot: number;
          available_lot: number;
        }) => ({
          location_name: lot.location_name,
          lot_name: lot.lot_name,
          vehicle_type: lot.vehicle_type,
          max_lot: lot.max_lot,
          used_lot: lot.used_lot,
          available_lot: lot.available_lot
        })
      )
    }));

    return res.status(200).json({
      responseStatus: 'SUCCESS',
      responseCode: '211000',
      responseMessage: `Success Fetch Data`,
      data: formattedLocations
    });
  } catch (error) {
    console.error('Error fetching location by code:', error);
    return res.status(500).json({
      Status: false,
      ResponseCode: '500500',
      Message: 'General Error'
    });
  }
}
