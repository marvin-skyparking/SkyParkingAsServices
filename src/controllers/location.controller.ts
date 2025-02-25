import { Request, Response } from 'express';
import {
  getAllLocations,
  getNearbyLocations
} from '../services/location_area.service';
import {
  signAsymmetricSignature,
  verifyAsymmetricSignature
} from '../services/signature.service';
import { getSecretKeyByClientId } from '../services/partner.service';

export async function generateSignatureSimulator(req: Request, res: Response) {
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

export async function getAllLocationsController(req: Request, res: Response) {
  try {
    const { client_id, signature, timestamp } = req.headers as {
      client_id?: string;
      signature?: string;
      timestamp?: string;
    };

    if (!client_id || !signature || !timestamp) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: Missing credentials' });
    }

    // Create the string to sign (matching what was signed by the client)
    const stringToSign = `${client_id}|${timestamp}`;

    // Verify the signature against the stored secret_key
    const isValidSignature = await verifyAsymmetricSignature(
      client_id,
      signature,
      stringToSign
    );

    if (!isValidSignature) {
      return res
        .status(403)
        .json({ success: false, message: 'Invalid signature' });
    }

    // Fetch locations
    const locations = await getAllLocations();
    return res.status(200).json({ success: true, data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
}

export async function getNearbyLocationsController(
  req: Request,
  res: Response
) {
  try {
    const { client_id, signature, timestamp } = req.headers as {
      client_id?: string;
      signature?: string;
      timestamp?: string;
    };

    console.log(req.headers)
    const { latitude, longitude, radius } = req.body;

    if (!client_id || !signature || !timestamp) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: Missing credentials' });
    }

    if (!latitude || !longitude || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude, radius'
      });
    }

    const secret_key = await getSecretKeyByClientId(client_id);
    if (!secret_key) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: Invalid client_id' });
    }

    const stringToSign = `${client_id}|${timestamp}`;
    const isValidSignature = await verifyAsymmetricSignature(
      client_id,
      signature,
      stringToSign
    );

    if (!isValidSignature) {
      return res
        .status(403)
        .json({
          Status: false,
          ResponseCode: '403400',
          Message: 'Forbidden: Invalid signature'
        });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const rad = Number(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude, longitude, or radius values'
      });
    }

    const locations = await getNearbyLocations(lat, lng, rad);

    // ✅ Ensure we are returning a plain object without Sequelize metadata
    const formattedLocations = locations.map((location) => ({
      location_code: location.location_code,
      location_name: location.location_name,
      address: location.address,
      coordinate: location.coordinate,
      category: location.category,
      lots:
        (location as any).lots?.map((lot: any) => ({
          lot_name: lot.lot_name,
          vehicle_type: lot.vehicle_type,
          max_lot: lot.max_lot,
          used_lot: lot.used_lot,
          available_lot: lot.available_lot
        })) ?? [] // Ensure `lots` is always an array
    }));

    return res.status(200).json({
      Status: true,
      ResponseCode: 200110,
      Data: formattedLocations
    });
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    return res
      .status(500)
      .json({
        Status: false,
        ResponseCode: '500500',
        Message: 'General Error'
      });
  }
}
