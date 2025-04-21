import { Op, Sequelize } from 'sequelize'; // Make sure Op is imported
import TransactionParkingIntegration from '../models/parking_transaction_integration.model';

export async function getInAreaData(locationCode: string): Promise<any[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // Set the time to midnight of today

  try {
    const trafficData = await TransactionParkingIntegration.findAll({
      attributes: [
        // Total count of vehicles
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn('DISTINCT', Sequelize.col('TransactionNo'))
          ),
          'TotalTraffic'
        ],

        // Conditional count for MOBIL
        [
          Sequelize.literal(
            `COUNT(DISTINCT CASE WHEN VehicleType = "MOBIL" THEN "TransactionNo" END)`
          ),
          'TrafficMobil'
        ],

        // Conditional count for MOTOR
        [
          Sequelize.literal(
            `COUNT(DISTINCT CASE WHEN VehicleType = "MOTOR" THEN "TransactionNo" END)`
          ),
          'TrafficMotor'
        ]
      ],
      where: {
        InTime: {
          [Op.gte]: startOfDay
        },
        LocationCode: locationCode,
        OutTime: {
          [Op.is]: null
        }
      },
      raw: true // Ensures raw data is returned
    });

    // If no data is found, return an empty array
    return trafficData.length > 0 ? trafficData : [];
  } catch (err) {
    console.error('❌ Error executing query:', (err as Error).message);
    return [];
  }
}

export async function getInAreaDataMANY(
  locationCodes: string[]
): Promise<any[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // Set the time to midnight of today

  try {
    const trafficData = await TransactionParkingIntegration.findAll({
      attributes: [
        // Total count of vehicles
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn('DISTINCT', Sequelize.col('TransactionNo'))
          ),
          'TOTAL_TRAFFIC'
        ],

        // Conditional count for MOBIL
        [
          Sequelize.literal(
            `COUNT(DISTINCT CASE WHEN VehicleType = 'MOBIL' THEN TransactionNo END)`
          ),
          'CAR_USED_LOT'
        ],

        // Conditional count for MOTOR
        [
          Sequelize.literal(
            `COUNT(DISTINCT CASE WHEN VehicleType = 'MOTOR' THEN TransactionNo END)`
          ),
          'MOTOR_USED_LOT'
        ]
      ],
      where: {
        InTime: {
          [Op.gte]: startOfDay
        },
        LocationCode: {
          [Op.in]: locationCodes
        },
        OutTime: {
          [Op.is]: null
        }
      },
      raw: true // Ensures raw data is returned
    });

    return trafficData.length > 0 ? trafficData : [];
  } catch (err) {
    console.error('❌ Error executing query:', (err as Error).message);
    return [];
  }
}
