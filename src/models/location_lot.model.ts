import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance
import LocationArea from './location_area.model';

export interface LocationAreaWithLots extends Model {
  id: number;
  location_code: string;
  location_name: string;
  address: string;
  coordinate: string | { latitude: number; longitude: number };
  category: string;
  lots: LocationLot[]; // Ensure this property exists
}

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
      defaultValue: 0,
      set(value: unknown) {
        // First, ensure `value` is a number, otherwise default to 0
        let num = 0;
        if (typeof value === 'number') {
          num = value < 0 ? 0 : value;
        }
        this.setDataValue('used_lot', num);
      }
    },
    available_lot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      set(value) {
        const maxLot = this.getDataValue('max_lot') ?? 0;
        let val = typeof value === 'number' ? value : Number(value);

        // If value is NaN or invalid, default to 0
        if (isNaN(val)) val = 0;

        // Clamp available_lot to max_lot
        this.setDataValue('available_lot', val > maxLot ? maxLot : val);
      }
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

// ✅ Define association here after both models are defined
LocationLot.belongsTo(LocationArea, {
  foreignKey: 'location_code',
  targetKey: 'location_code',
  as: 'LocationArea'
});

LocationArea.hasMany(LocationLot, {
  foreignKey: 'location_code',
  sourceKey: 'location_code',
  as: 'lots'
});

export default LocationLot;
