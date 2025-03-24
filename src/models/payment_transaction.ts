import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

interface PaymentConfirmationAttributes {
  id: number;
  storeCode: string;
  transactionNo: string;
  referenceNo: string;
  amount: number;
  paymentStatus: string;
  paymentReferenceNo: string;
  paymentDate: string;
  partnerID: string;
  retrievalReferenceNo: string;
  approvalCode: string;
  createdBy: string;
  createdOn: Date;
}

// Define optional fields for creation
interface PaymentConfirmationCreationAttributes
  extends Optional<PaymentConfirmationAttributes, 'id'> {}

class PaymentConfirmation
  extends Model<
    PaymentConfirmationAttributes,
    PaymentConfirmationCreationAttributes
  >
  implements PaymentConfirmationAttributes
{
  public id!: number;
  public storeCode!: string;
  public transactionNo!: string;
  public referenceNo!: string;
  public amount!: number;
  public paymentStatus!: string;
  public paymentReferenceNo!: string;
  public paymentDate!: string;
  public partnerID!: string;
  public retrievalReferenceNo!: string;
  public approvalCode!: string;
  public createdBy!: string;
  public createdOn!: Date;
}

PaymentConfirmation.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    storeCode: { type: DataTypes.STRING(50), allowNull: false },
    transactionNo: { type: DataTypes.STRING(50), allowNull: false },
    referenceNo: { type: DataTypes.STRING(50), allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    paymentStatus: { type: DataTypes.STRING(50), allowNull: false },
    paymentReferenceNo: { type: DataTypes.STRING(50), allowNull: false },
    paymentDate: { type: DataTypes.STRING(50), allowNull: false },
    partnerID: { type: DataTypes.STRING(50), allowNull: false },
    retrievalReferenceNo: { type: DataTypes.STRING(50), allowNull: false },
    approvalCode: { type: DataTypes.STRING(50), allowNull: false },
    createdBy: { type: DataTypes.STRING(50), allowNull: false },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'PaymentConfirmation',
    timestamps: false
  }
);

export default PaymentConfirmation;
