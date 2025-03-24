import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

interface TicketGeneratorAttributes {
  id: number;
  transactionNo: string;
  tarif: number;
  grace_period: number;
  inTime: Date;
  outTime?: Date | null;
  status: 'PAID' | 'UNPAID';
  url_ticket?: string | null;
  vehicle_type: 'MOBIL' | 'MOTOR';
  reference_no: string;
  created_at: Date;
  updated_at: Date;
}

// Optional fields for creation
interface TicketGeneratorCreationAttributes
  extends Optional<
    TicketGeneratorAttributes,
    'id' | 'outTime' | 'url_ticket' | 'created_at' | 'updated_at'
  > {}

class TicketGenerator
  extends Model<TicketGeneratorAttributes, TicketGeneratorCreationAttributes>
  implements TicketGeneratorAttributes
{
  public id!: number;
  public transactionNo!: string;
  public tarif!: number;
  public grace_period!: number;
  public inTime!: Date;
  public outTime!: Date | null;
  public status!: 'PAID' | 'UNPAID';
  public vehicle_type!: 'MOBIL' | 'MOTOR';
  public reference_no!: string;
  public url_ticket!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

TicketGenerator.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    transactionNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tarif: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grace_period: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    outTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PAID', 'UNPAID'),
      allowNull: false,
      defaultValue: 'UNPAID'
    },
    url_ticket: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vehicle_type: {
      type: DataTypes.ENUM('MOBIL', 'MOTOR'),
      allowNull: false
    },
    reference_no: {
      type: DataTypes.STRING,
      allowNull: true
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
    tableName: 'ticket_generator',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default TicketGenerator;
