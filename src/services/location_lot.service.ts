import sequelize from '../configs/database'; // Ensure this imports your Sequelize instance
import LocationLot from '../models/location_lot.model';

export async function updateLotStatus(
  id: number,
  locationCode: string,
  action: 'in' | 'out'
) {
  const transaction = await sequelize.transaction(); // Correct transaction handling

  try {
    // Find the location lot by location_id and location_code
    const lot = await LocationLot.findOne({
      where: { id: id, location_code: locationCode },
      transaction // Include transaction in find query (optional)
    });

    if (!lot) {
      throw new Error('Location lot not found');
    }

    if (action === 'in') {
      //   if (lot.available_lot <= 0) {
      //     throw new Error("No available lots");
      //   }
      lot.available_lot -= 1;
      lot.used_lot += 1;
    } else if (action === 'out') {
      //   if (lot.used_lot <= 0) {
      //     throw new Error("No used lots to free up");
      //   }
      lot.available_lot += 1;
      lot.used_lot -= 1;
    } else {
      throw new Error('Invalid action');
    }

    // Save updated values with transaction
    await lot.save({ transaction });

    await transaction.commit(); // Commit if successful
    return { message: `Successfully updated lot for ${action}`, lot };
  } catch (error: any) {
    await transaction.rollback(); // Rollback on error
    throw new Error(`Failed to update lot: ${error.message}`);
  }
}
