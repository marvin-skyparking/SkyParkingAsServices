// models/location_area.model.ts

import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance
import { AllowNull } from 'sequelize-typescript';

export enum PropertyType {
  Apartment = 'Apartment',
  RetailsAndMalls = 'Retails & Malls',
  RukoAndOffice = 'Ruko & Office',
  Office = 'Office',
  Hospital = 'Hospital',
  External = 'External',
  Others = 'Others',
  SchoolOrUniversity = 'School / University',
  NotSet = 'NOT SET'
}

export enum Region {
  Region1 = 'REGION 1',
  Region2 = 'REGION 2',
  Region3 = 'REGION 3',
  Region4 = 'REGION 4',
  Region5 = 'REGION 5',
  Region6 = 'REGION 6',
  Region7 = 'REGION 7',
  Region8 = 'REGION 8'
}

interface LocationAreaAttributes {
  id: number;
  location_code: string;
  location_name: string;
  address: Text;
  coordinate: string;
  KID: string;
  minimum_point: number;
  region_coordinator: string;
  category: PropertyType;
  vendor: string;
  region: Region;
  total_lot: number;
  Create_by: number;
  Update_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface LocationAreaCreationAttributes
  extends Optional<
    LocationAreaAttributes,
    'id' | 'created_at' | 'updated_at'
  > {}

export class LocationArea
  extends Model<LocationAreaAttributes, LocationAreaCreationAttributes>
  implements LocationAreaAttributes
{
  public id!: number;
  public location_code!: string;
  public location_name!: string;
  public address!: Text;
  public coordinate!: string;
  public KID!: string;
  public minimum_point!: number;
  public region_coordinator!: string;
  public category!: PropertyType;
  public vendor!: string;
  public region!: Region;
  public total_lot!: number;
  public Create_by!: number;
  public Update_by!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

LocationArea.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    location_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    coordinate: {
      type: DataTypes.JSON,
      allowNull: false
    },
    KID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    minimum_point: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    region_coordinator: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(...Object.values(PropertyType)),
      allowNull: false,
      defaultValue: PropertyType.NotSet
    },
    vendor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    region: {
      type: DataTypes.ENUM(...Object.values(Region)),
      allowNull: false
    },
    total_lot: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    Create_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Update_by: {
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
    tableName: 'location_area',
    timestamps: false
  }
);
