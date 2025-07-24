import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

export function defaultTransactionData(
  transactionNo: string | null = '',
  transactionStatus: string = 'INVALID',
  paymentStatus: string = 'UNPAID'
): TransactionData {
  return {
    transactionNo: transactionNo || '',
    transactionStatus,
    inTime: '',
    duration: null,
    tariff: null,
    vehicleType: '',
    outTime: '',
    gracePeriod: null,
    location: '',
    paymentStatus
  };
}

export function defaultTransactionDataAutoEntry(
  transactionNo: string | null = '',
  status: string = 'INVALID',
  licensePlateNo: string | null = '',
  locationCode: string | null = ''
): TransactionDataAutoEntry {
  return {
    transactionNo: transactionNo || '',
    licensePlateNo: licensePlateNo || '',
    locationCode: locationCode || '',
    customerEmail: '',
    status: status || ''
  };
}

export function defaultTransactionDataPaid(
  transactionNo: string | null = '',
  transactionStatus: string = 'VALID',
  paymentStatus: string = 'PAID'
): TransactionData {
  return {
    transactionNo: transactionNo || '',
    transactionStatus,
    inTime: '',
    duration: null,
    tariff: null,
    vehicleType: '',
    outTime: '',
    gracePeriod: null,
    location: '',
    paymentStatus
  };
}

// Updated 15-07-2025 (Galih Raka Gustiawan)
// Adding Voucher Module
export interface GenerateInquirySignature {
  login: string;
  password: string;
  storeID: string;
  transactionNo: string;
}

export interface InquirySignature {
  data: string;
}

export interface InquiryTarifResponse {
  transactionNo: string;
  inTime: string;
  duration: number;
  tariff: number;
  vehicleType: string;
  outTime: string;
  gracePeriod: number;
  location: string;
  paymentStatus: string;
}

export interface InquiryResponse {
  responseCode?: string;
  responseMessage?: string;
  signature?: string;
  data: string;
}
// End Update

export interface TransactionData {
  transactionNo: string;
  transactionStatus: string;
  inTime: string;
  duration: number | null;
  tariff: number | null;
  vehicleType: string;
  outTime: string;
  gracePeriod: number | null;
  location: string;
  paymentStatus: string;
}

export interface TransactionDataAutoEntry {
  transactionNo: string;
  licensePlateNo: string;
  locationCode: string;
  customerEmail: string;
  status: string;
}

interface InquiryTransactionAttributes {
  Id: bigint;
  CompanyName?: string;
  NMID?: string;
  StoreCode?: string;
  TransactionNo?: string;
  ReferenceNo?: string;
  ProjectCategoryId?: number;
  ProjectCategoryName?: string;
  DataSend?: string;
  DataResponse?: string;
  DataDetailResponse?: string;
  CreatedOn?: Date;
  CreatedBy?: string;
  UpdatedOn?: Date;
  UpdatedBy?: string;
}

// Define optional attributes
type InquiryTransactionCreationAttributes = Optional<
  InquiryTransactionAttributes,
  'Id'
>;

class InquiryTransaction
  extends Model<
    InquiryTransactionAttributes,
    InquiryTransactionCreationAttributes
  >
  implements InquiryTransactionAttributes
{
  public Id!: bigint;
  public CompanyName?: string;
  public NMID?: string;
  public StoreCode?: string;
  public TransactionNo?: string;
  public ReferenceNo?: string;
  public ProjectCategoryId?: number;
  public ProjectCategoryName?: string;
  public DataSend?: string;
  public DataResponse?: string;
  public DataDetailResponse?: string;
  public CreatedOn?: Date;
  public CreatedBy?: string;
  public UpdatedOn?: Date;
  public UpdatedBy?: string;
}

InquiryTransaction.init(
  {
    Id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    CompanyName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    NMID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    StoreCode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    TransactionNo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ReferenceNo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ProjectCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    ProjectCategoryName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    DataSend: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DataResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DataDetailResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'InquiryTransaction',
    timestamps: false
  }
);

export default InquiryTransaction;
