import { Request, Response } from 'express';
import { updateLotStatus } from '../services/location_lot.service';
import { getLocationsByCode } from '../services/location_area.service';
import { verifyAsymmetricSignature } from '../services/signature.service';
import { getSecretKeyByClientId } from '../services/partner.service';

export async function updateLot(req: Request, res: Response): Promise<any> {
  try {
    const { locationCode, lot_name, action } = req.body;

    // Validate required fields
    if (!lot_name || !locationCode || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (action !== 'in' && action !== 'out') {
      return res
        .status(400)
        .json({ error: "Invalid action. Use 'in' or 'out'." });
    }

    // Call the service function
    const result = await updateLotStatus(lot_name, locationCode, action);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getLocationByCodeController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { clientkey, signature, timestamp } = req.headers as {
      clientkey?: string;
      signature?: string;
      timestamp?: string;
    };

    if (!clientkey || !signature || !timestamp) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401400',
        responseMessage: 'Unauthorized, Missing credentials'
      });
    }

    const { location_code } = req.params;

    const secret_key = await getSecretKeyByClientId(clientkey);
    if (!secret_key) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401401',
        responseMessage: 'Unauthorized, Invalid clientkey'
      });
    }

    const stringToSign = `${clientkey}|${timestamp}`;
    const isValidSignature = await verifyAsymmetricSignature(
      clientkey,
      signature,
      stringToSign
    );

    if (!location_code) {
      return res.status(400).json({
        Status: false,
        ResponseCode: '400400',
        Message: 'Missing required field: location_code'
      });
    }

    const locations = await getLocationsByCode(location_code);

    if (!locations || locations.length === 0) {
      return res.status(404).json({
        Status: false,
        ResponseCode: '404404',
        Message: 'Location not found'
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
      Status: true,
      ResponseCode: '200110',
      Data: formattedLocations
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
