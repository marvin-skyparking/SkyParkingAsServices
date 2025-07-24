import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust path as needed

export function defaultTransactionData(
  transactionNo: string | null = '',
  referenceNo: string | null = '',
  transactionStatus: string = 'INVALID'
): TransactionData {
  return {
    transactionNo: transactionNo || '',
    referenceNo: referenceNo || '',
    transactionStatus
  };
}

interface AutoEntryResponse {
  transactionNo: string;
  referenceNo: string;
  transactionStatus: string;
  responseStatus: string;
  responseCode: string;
  responseDescription: string;
  messageDetail: string;
}

export function autoFailedTransactionEntry(
  transactionNo: string | null = '',
  referenceNo: string | null = '',
  transactionStatus: string = 'INVALID'
): AutoEntryResponse {
  return {
    transactionNo: transactionNo || '',
    referenceNo: referenceNo || '',
    transactionStatus,
    responseStatus: 'Failed',
    responseCode: '211001',
    responseDescription: 'Invalid Transaction',
    messageDetail: 'The transaction is invalid, or error has occurred'
  };
}

export interface TransactionData {
  transactionNo: string;
  referenceNo?: string; // Optional field
  transactionStatus: string;
}
// Create a type alias for IDs
type Id = bigint;

export interface TransactionParkingIntegrationAttributes {
  Id: number;
  TrxRefId?: number;
  TransactionNo?: string;
  ReferenceNo?: string;
  LicensePlateIn?: string;
  LocationCode?: string;
  SubLocationCode?: string;
  InTime?: Date;
  GateInCode?: string;
  VehicleType?: string;
  ProductName?: string;
  GracePeriodIn?: number;
  QRTicket?: string;
  Duration?: number;
  TariffAmount?: number;
  VoucherAmount?: number;
  PaymentAmount?: number;
  PaymentStatus?: string;
  PaymentDate?: Date | null;
  PaymentMethod?: string;
  IssuerID?: string;
  PaymentReferenceNo?: string;
  RetrievalReferenceNo?: string;
  PrepaidCardName?: string;
  PrepaidCardNo?: string;
  PrepaidCardMID?: string;
  PrepaidCardTID?: string;
  PrepaidCardInitialBalance?: number;
  PrepaidCardRemainingBalance?: number;
  ReferenceTransactionNo?: string;
  GracePeriodPayment?: number;
  LicensePlateOut?: string;
  OutTime?: Date | null;
  GateOutCode?: string;
  MerchantDataRequestIN?: string;
  MerchantDataResponseIN?: string;
  POSTDataRequestIN?: string;
  POSTDataResponseIN?: string;
  MerchantDataRequestPAY?: string;
  MerchantDataResponsePAY?: string;
  POSTDataRequestPAY?: string;
  POSTDataResponsePAY?: string;
  MerchantDataRequestOUT?: string;
  MerchantDataResponseOUT?: string;
  POSTDataRequestOUT?: string;
  POSTDataResponseOUT?: string;
  RecordStatus?: number;
  CreatedBy?: string;
  CreatedOn?: Date;
  UpdatedBy?: string;
  UpdatedOn?: Date;
}

interface TransactionParkingIntegrationCreationAttributes
  extends Optional<TransactionParkingIntegrationAttributes, 'Id'> {}

class TransactionParkingIntegration
  extends Model<
    TransactionParkingIntegrationAttributes,
    TransactionParkingIntegrationCreationAttributes
  >
  implements TransactionParkingIntegrationAttributes
{
  public Id!: number;
  public TrxRefId!: number;
  public TransactionNo?: string;
  public ReferenceNo?: string;
  public LicensePlateIn?: string;
  public LocationCode?: string;
  public SubLocationCode?: string;
  public InTime?: Date;
  public GateInCode?: string;
  public VehicleType?: string;
  public ProductName?: string;
  public GracePeriodIn?: number;
  public QRTicket?: string;
  public Duration?: number;
  public TariffAmount?: number;
  public VoucherAmount?: number;
  public PaymentAmount?: number;
  public PaymentStatus?: string;
  public PaymentDate?: Date;
  public PaymentMethod?: string;
  public IssuerID?: string;
  public PaymentReferenceNo?: string;
  public RetrievalReferenceNo?: string;
  public PrepaidCardName?: string;
  public PrepaidCardNo?: string;
  public PrepaidCardMID?: string;
  public PrepaidCardTID?: string;
  public PrepaidCardInitialBalance?: number;
  public PrepaidCardRemainingBalance?: number;
  public ReferenceTransactionNo?: string;
  public GracePeriodPayment?: number;
  public LicensePlateOut?: string;
  public OutTime?: Date;
  public GateOutCode?: string;
  public MerchantDataRequestIN?: string;
  public MerchantDataResponseIN?: string;
  public POSTDataRequestIN?: string;
  public POSTDataResponseIN?: string;
  public MerchantDataRequestPAY?: string;
  public MerchantDataResponsePAY?: string;
  public POSTDataRequestPAY?: string;
  public POSTDataResponsePAY?: string;
  public MerchantDataRequestOUT?: string;
  public MerchantDataResponseOUT?: string;
  public POSTDataRequestOUT?: string;
  public POSTDataResponseOUT?: string;
  public RecordStatus?: number;
  public CreatedBy?: string;
  public CreatedOn?: Date;
  public UpdatedBy?: string;
  public UpdatedOn?: Date;
}

TransactionParkingIntegration.init(
  {
    Id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    TrxRefId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: sequelize.literal(
        '(SELECT COALESCE(MAX(Id), 0) + 1 FROM TransactionParkingIntegration)'
      )
    },
    TransactionNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ReferenceNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LicensePlateIn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocationCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SubLocationCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    InTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    GateInCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VehicleType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProductName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GracePeriodIn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    QRTicket: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TariffAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    VoucherAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    PaymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    PaymentStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PaymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PaymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IssuerID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PaymentReferenceNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    RetrievalReferenceNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PrepaidCardName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PrepaidCardNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PrepaidCardMID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PrepaidCardTID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PrepaidCardInitialBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    PrepaidCardRemainingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    ReferenceTransactionNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GracePeriodPayment: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    LicensePlateOut: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OutTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    GateOutCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MerchantDataRequestIN: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MerchantDataResponseIN: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataRequestIN: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataResponseIN: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MerchantDataRequestPAY: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MerchantDataResponsePAY: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataRequestPAY: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataResponsePAY: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MerchantDataRequestOUT: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MerchantDataResponseOUT: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataRequestOUT: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataResponseOUT: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    RecordStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'TransactionParkingIntegration',
    timestamps: false
  }
);

export default TransactionParkingIntegration;
