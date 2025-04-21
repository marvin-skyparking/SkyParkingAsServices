import { Request, response, Response } from 'express';
import {
  getAllLocations,
  getNearbyLocations
} from '../services/location_area.service';
import {
  signAsymmetricSignature,
  verifyAsymmetricSignature
} from '../services/signature.service';
import { getSecretKeyByClientId } from '../services/partner.service';
import {
  getInAreaData,
  getInAreaDataMANY
} from '../services/realtime_integration.service';

export async function generateSignatureSimulator(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const client_id = req.headers['client_id'] as string;
    const secret_key = req.headers['secret_key'] as string;
    const timestamp = req.headers['timestamp'] as string; // Using 'timestamp' header

    if (!client_id || !secret_key || !timestamp) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required headers' });
    }

    // Create the string to sign (client_id + timestamp)
    const stringToSign = `${client_id}|${timestamp}`;

    // Generate signature using secret_key
    const signature = signAsymmetricSignature(secret_key, stringToSign);

    return res.status(200).json({
      success: true,
      client_id,
      timestamp,
      signature
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
}

export async function getAllLocationsController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { client_key, signature, timestamp } = req.headers as {
      client_key?: string;
      signature?: string;
      timestamp?: string;
    };

    if (!client_key || !signature || !timestamp) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401400',
        responseMessage: 'Unauthorized, Missing credentials'
      });
    }

    // Create the string to sign (matching what was signed by the client)
    const stringToSign = `${client_key}|${timestamp}`;

    // Verify the signature against the stored secret_key
    const isValidSignature = await verifyAsymmetricSignature(
      client_key,
      signature,
      stringToSign
    );

    if (!isValidSignature) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401401',
        responseMessage: 'Unauthorized, Invalid Siganture'
      });
    }

    // Fetch locations
    const locations = await getAllLocations();
    return res.status(200).json({
      responseStatus: 'SUCCESS',
      responseCode: '211000',
      responseMessage: 'Success Get Location',
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({
      responseStatus: 'FAILED',
      responseCode: '500500',
      responseMessage: 'GENERAL SERVER ERROR'
    });
  }
}

export async function getNearbyLocationsController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { client_key, signature, timestamp } = req.headers as {
      client_key?: string;
      signature?: string;
      timestamp?: string;
    };

    console.log(req.headers);
    const { latitude, longitude, radius, category } = req.body;

    if (!client_key || !signature || !timestamp) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401400',
        responseMessage: 'Unauthorized, Missing credentials'
      });
    }

    if (!latitude || !longitude || !radius) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '400402',
        responseMessage: 'Missing required fields: latitude, longitude, radius'
      });
    }

    const secret_key = await getSecretKeyByClientId(client_key);
    if (!secret_key) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401401',
        responseMessage: 'Unauthorized, Invalid client_key'
      });
    }

    const stringToSign = `${client_key}|${timestamp}`;
    const isValidSignature = await verifyAsymmetricSignature(
      client_key,
      signature,
      stringToSign
    );

    if (!isValidSignature) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401401',
        responseMessage: 'Unauthorized, Invalid Siganture'
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const rad = Number(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({
        responseStatus: 'FAILED',
        responseCode: '400402',
        responseMessage: 'Invalid format latitude, longitude, or radius values'
      });
    }

    const locations = await getNearbyLocations(lat, lng, rad, category);

    const location_realtime = await getInAreaDataMANY(
      locations.map((loc) => loc.location_code)
    );

    // ✅ Ensure we are returning a plain object without Sequelize metadata
    const formattedLocations = locations.map((location) => ({
      location_code: location.location_code,
      location_name: location.location_name,
      address: location.address,
      coordinate: location.coordinate,
      category: location.category,
      parking_lot: location_realtime.map((item) => ({
        TOTAL_TRAFFIC: item.TOTAL_TRAFFIC ?? 0,
        CAR_USED_LOT: item.CAR_USED_LOT ?? 0, // You can customize this per item if needed
        MOTOR_USED_LOT: item.MOTOR_USED_LOT ?? 0,
        CAR_AVAILABLE: location.total_lot_mobil - item.CAR_USED_LOT,
        MOTOR_AVAILABLE: location.total_lot_mobil - item.MOTOR_USED_LOT
      }))
      // lots:
      //   (location as any).lots?.map((lot: any) => ({
      //     lot_name: lot.lot_name,
      //     vehicle_type: lot.vehicle_type,
      //     max_lot: lot.max_lot,
      //     used_lot: lot.used_lot,
      //     available_lot: lot.available_lot
      //   })) ?? [] // Ensure `lots` is always an array
    }));

    return res.status(200).json({
      responseStatus: 'SUCCESS',
      responseCode: '211000',
      responseMessage: 'Success Get Nearby Location',
      data: formattedLocations
    });
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    return res.status(500).json({
      responseStatus: 'FAILED',
      responseCode: '500500',
      responseMessage: 'GENERAL SERVER ERROR'
    });
  }
}

export async function getInArea(req: Request, res: Response) {
  const locationCodes = req.query.locationCodes as string;

  if (!locationCodes) {
    return res.status(400).json({
      success: false,
      message:
        '⚠️ Harap masukkan location code. Contoh: ?locationCodes=012SK,013SK'
    });
  }

  try {
    const data = await getInAreaData(locationCodes);

    return res.status(200).json({
      success: true,
      message: '✅ Data retrieved successfully',
      data
    });
  } catch (error) {
    console.error('❌ Error in controller:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Failed to retrieve data',
      error: (error as Error).message
    });
  }
}
