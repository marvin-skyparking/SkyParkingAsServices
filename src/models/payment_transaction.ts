import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

interface PaymentConfirmationAttributes {
  id: number;
  NMID?: string;
  StoreCode?: string;
  transactionNo?: string;
  referenceNo?: string;
  amount?: number;
  paymentStatus?: string;
  paymentReferenceNo?: string;
  paymentDate?: string;
  partnerID?: string;
  retrievalReferenceNo?: string;
  approvalCode?: string;
  referenceTransactionNo?: string;
  DataReceived?: string;
  DataSend?: string;
  DataResponse?: string;
  DataDetailResponse?: string;
  CreatedOn?: Date;
  CreatedBy?: string;
  MerchantDataRequest?: string;
  MerchantDataResponse?: string;
  POSTDataRequest?: string;
  POSTDataResponse?: string;
}

type PaymentConfirmationCreationAttributes = Optional<
  PaymentConfirmationAttributes,
  'id'
>;

class PaymentConfirmation
  extends Model<
    PaymentConfirmationAttributes,
    PaymentConfirmationCreationAttributes
  >
  implements PaymentConfirmationAttributes
{
  public id!: number;
  public NMID?: string;
  public StoreCode?: string;
  public transactionNo?: string;
  public referenceNo?: string;
  public amount?: number;
  public paymentStatus?: string;
  public paymentReferenceNo?: string;
  public paymentDate?: string;
  public partnerID?: string;
  public retrievalReferenceNo?: string;
  public approvalCode?: string;
  public referenceTransactionNo?: string;
  public DataReceived?: string;
  public DataSend?: string;
  public DataResponse?: string;
  public DataDetailResponse?: string;
  public CreatedOn?: Date;
  public CreatedBy?: string;
  public MerchantDataRequest?: string;
  public MerchantDataResponse?: string;
  public POSTDataRequest?: string;
  public POSTDataResponse?: string;
}

PaymentConfirmation.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    NMID: {
      type: DataTypes.STRING(50)
    },
    StoreCode: {
      type: DataTypes.STRING(50)
    },
    transactionNo: {
      type: DataTypes.STRING(50)
    },
    referenceNo: {
      type: DataTypes.STRING(50)
    },
    amount: {
      type: DataTypes.INTEGER
    },
    paymentStatus: {
      type: DataTypes.STRING(50)
    },
    paymentReferenceNo: {
      type: DataTypes.STRING(50)
    },
    paymentDate: {
      type: DataTypes.STRING(50)
    },
    partnerID: {
      type: DataTypes.STRING(50)
    },
    retrievalReferenceNo: {
      type: DataTypes.STRING(50)
    },
    approvalCode: {
      type: DataTypes.STRING(50)
    },
    referenceTransactionNo: {
      type: DataTypes.STRING(50)
    },
    DataReceived: {
      type: DataTypes.TEXT
    },
    DataSend: {
      type: DataTypes.TEXT
    },
    DataResponse: {
      type: DataTypes.TEXT
    },
    DataDetailResponse: {
      type: DataTypes.TEXT
    },
    CreatedOn: {
      type: DataTypes.DATE
    },
    CreatedBy: {
      type: DataTypes.STRING(255)
    },
    MerchantDataRequest: {
      type: DataTypes.TEXT
    },
    MerchantDataResponse: {
      type: DataTypes.TEXT
    },
    POSTDataRequest: {
      type: DataTypes.TEXT
    },
    POSTDataResponse: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    tableName: 'PaymentConfirmation',
    timestamps: false // manually handled
  }
);

export default PaymentConfirmation;
