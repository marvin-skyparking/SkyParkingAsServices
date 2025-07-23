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
    const clientkey = req.headers['clientkey'] as string;
    const secretkey = req.headers['secretkey'] as string;
    const timestamp = req.headers['timestamp'] as string; // Using 'timestamp' header

    console.log(req.headers);
    if (!clientkey || !secretkey || !timestamp) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required headers' });
    }

    // Create the string to sign (clientkey + timestamp)
    const stringToSign = `${clientkey}|${timestamp}`;

    // Generate signature using secret_key
    const signature = signAsymmetricSignature(secretkey, stringToSign);

    return res.status(200).json({
      success: true,
      clientkey,
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

    // Create the string to sign (matching what was signed by the client)
    const stringToSign = `${clientkey}|${timestamp}`;

    // Verify the signature against the stored secret_key
    const isValidSignature = await verifyAsymmetricSignature(
      clientkey,
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
    const { clientkey, signature, timestamp } = req.headers as {
      clientkey?: string;
      signature?: string;
      timestamp?: string;
    };

    console.log(req.headers);
    const { latitude, longitude, radius, category } = req.body;

    if (!clientkey || !signature || !timestamp) {
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

    if (!isValidSignature) {
      return res.status(200).json({
        responseStatus: 'FAILED',
        responseCode: '401401',
        responseMessage: 'Unauthorized, Invalid Signature'
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

    // 🧭 Get nearby locations
    const locations = await getNearbyLocations(lat, lng, rad, category);

    // 🚦 Get parking traffic info
    const locationCodes = locations.map((loc) => loc.location_code);
    const location_realtime = await getInAreaDataMANY(locationCodes);

    console.log(locationCodes);

    // 🧩 Match traffic data to each location
    const formattedLocations = locations.map((location) => {
      const realtime = location_realtime.find(
        (item) => item.LocationCode === location.location_code
      );

      return {
        location_code: location.location_code,
        location_name: location.location_name,
        address: location.address,
        coordinate: location.coordinate,
        category: location.category,
        parking_lot: [
          {
            TOTAL_TRAFFIC: realtime?.TOTAL_TRAFFIC ?? 0,
            CAR_USED_LOT: realtime?.CAR_USED_LOT ?? 0,
            MOTOR_USED_LOT: realtime?.MOTOR_USED_LOT ?? 0,
            CAR_AVAILABLE:
              (location.total_lot_mobil || 0) - (realtime?.CAR_USED_LOT ?? 0),
            MOTOR_AVAILABLE:
              (location.total_lot_motor || 0) - (realtime?.MOTOR_USED_LOT ?? 0)
          }
        ]
      };
    });

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
