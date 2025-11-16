import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface PaymentInAppLogsAttributes {
  id?: number;
  status: 'FAILED' | 'SUCCESS';
  module: 'INQUIRY' | 'PAYMENT';
  paymentStatus: 'UNPAID' | 'PAID';
  transactionNo?: string | null;
  referenceNo?: string | null;
  paymentReferenceNo?: string | null;
  inquiryDate?: Date | null;
  paymentDate?: Date | null;
  issuerID?: string | null;
  retrivalReferenceNo?: string | null;
  approvalCode?: string | null;
  referenceTransactionNo?: string | null;
  ClientRequest?: string | null;
  ClientResponse?: string | null;
  PostRequest?: string | null;
  PostResponse?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export type PaymentInAppLogsCreationAttributes = Optional<
  PaymentInAppLogsAttributes,
  'id'
>;

export class PaymentInAppLogs
  extends Model<PaymentInAppLogsAttributes, PaymentInAppLogsCreationAttributes>
  implements PaymentInAppLogsAttributes
{
  public id!: number;
  public status!: 'FAILED' | 'SUCCESS';
  public module!: 'INQUIRY' | 'PAYMENT';
  public paymentStatus!: 'UNPAID' | 'PAID';
  public transactionNo!: string | null;
  public referenceNo!: string | null;
  public paymentReferenceNo!: string | null;
  public inquiryDate!: Date | null;
  public paymentDate!: Date | null;
  public issuerID!: string | null;
  public retrivalReferenceNo!: string | null;
  public approvalCode!: string | null;
  public referenceTransactionNo!: string | null;
  public ClientRequest!: string | null;
  public ClientResponse!: string | null;
  public PostRequest!: string | null;
  public PostResponse!: string | null;
  public readonly createdAt!: Date | null;
  public readonly updatedAt!: Date | null;

  static initModel(sequelize: Sequelize): typeof PaymentInAppLogs {
    PaymentInAppLogs.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true
        },
        status: {
          type: DataTypes.ENUM('FAILED', 'SUCCESS'),
          allowNull: false
        },
        module: {
          type: DataTypes.ENUM('INQUIRY', 'PAYMENT'),
          allowNull: false
        },
        paymentStatus: {
          type: DataTypes.ENUM('UNPAID', 'PAID'),
          allowNull: false
        },
        transactionNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        referenceNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        paymentReferenceNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        inquiryDate: {
          type: DataTypes.DATE(3), // millisecond precision
          allowNull: true
        },
        paymentDate: {
          type: DataTypes.DATE(3),
          allowNull: true
        },
        issuerID: {
          type: DataTypes.STRING,
          allowNull: true
        },
        retrivalReferenceNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        approvalCode: {
          type: DataTypes.STRING,
          allowNull: true
        },
        referenceTransactionNo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        ClientRequest: {
          type: DataTypes.TEXT('long'),
          allowNull: true
        },
        ClientResponse: {
          type: DataTypes.TEXT('long'),
          allowNull: true
        },
        PostRequest: {
          type: DataTypes.TEXT('long'),
          allowNull: true
        },
        PostResponse: {
          type: DataTypes.TEXT('long'),
          allowNull: true
        },
        createdAt: {
          type: DataTypes.DATE(3),
          allowNull: true
        },
        updatedAt: {
          type: DataTypes.DATE(3),
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'PAYMENT_INAPP_LOGS',
        timestamps: true
      }
    );
    return PaymentInAppLogs;
  }
}
