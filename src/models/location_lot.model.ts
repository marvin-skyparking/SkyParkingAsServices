import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

interface LocationLotAttributes {
  id: number;
  location_code: string;
  location_name: string;
  lot_name: string;
  vehicle_type: 'MOBIL' | 'MOTOR';
  max_lot: number;
  used_lot: number;
  available_lot: number;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface LocationLotCreationAttributes
  extends Optional<LocationLotAttributes, 'id'> {}

class LocationLot
  extends Model<LocationLotAttributes, LocationLotCreationAttributes>
  implements LocationLotAttributes
{
  public id!: number;
  public location_code!: string;
  public location_name!: string;
  public lot_name!: string;
  public vehicle_type!: 'MOBIL' | 'MOTOR';
  public max_lot!: number;
  public used_lot!: number;
  public available_lot!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

LocationLot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    location_code: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'location_area',
        key: 'location_code'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lot_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicle_type: {
      type: DataTypes.ENUM('MOBIL', 'MOTOR'),
      allowNull: false
    },
    max_lot: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    used_lot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    available_lot: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'location_lot',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default LocationLot;
