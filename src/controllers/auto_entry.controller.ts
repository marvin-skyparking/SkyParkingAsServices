import { Request, Response } from 'express';
import {
  DecryptTotPOST,
  EncryptTotPOST,
  generateAutoEntrySignature,
  RealencryptPayload,
  RealencryptPayloadAutoEntry
} from '../utils/encrypt.utils';
import {} from '../models/parking_transaction_integration.model';
import { defaultTransactionDataAutoEntry } from '../models/inquiry_transaction';
import { ERROR_MESSAGES } from '../constant/INAPP.errormessage';
import {
  findInquiryTransactionMapping,
  findInquiryTransactionMappingPartner,
  findLocationStoreCodeData
} from '../services/inquiry_transaction_mapping.service';
import { DecryptedAutoEntry } from '../models/styles_member.model';
import axios from 'axios';
import qs from 'qs';
import {
  ACCESS_CREDENTIAL,
  ERROR_ON_LIPPO_MALLS
} from '../constant/LIPPO_MALLS_ACCESS';
import EnvConfig from '../configs/env.config';
import { createStylesCheckMembership } from '../services/auto_entry.service';

/**
 * Auto Entry Handler
 */
export async function auto_entry(req: Request, res: Response): Promise<any> {
  const encryptAndRespondAutoEntry = async (
    payload: any,
    key: string,
    transactionNo?: string
  ) => {
    if (!payload.data) {
      payload.data = defaultTransactionDataAutoEntry(transactionNo);
    }
    const encrypted = await EncryptTotPOST(payload, key);
    return res.status(200).json({ data: encrypted });
  };

  try {
    const { data } = req.body;

    if (!data) {
      return encryptAndRespondAutoEntry(
        ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        'PARTNER_KEY'
      );
    }

    const decryptedObject = DecryptTotPOST(data, 'PARTNER_KEY');

    if (!decryptedObject) {
      return encryptAndRespondAutoEntry(
        ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
        'PARTNER_KEY',
        ''
      );
    }

    const {
      login,
      password,
      transactionNo,
      licensePlateNo,
      locationCode,
      signature
    } = decryptedObject;

    if (
      ![
        login,
        password,
        transactionNo,
        licensePlateNo,
        locationCode,
        signature
      ].every(Boolean)
    ) {
      return encryptAndRespondAutoEntry(
        ERROR_MESSAGES.MISSING_FIELDS,
        'PARTNER_KEY',
        transactionNo
      );
    }

    const validateCredential = await findInquiryTransactionMappingPartner(
      login,
      password
    );

    if (!validateCredential) {
      return encryptAndRespondAutoEntry(
        ERROR_MESSAGES.INVALID_CREDENTIAL,
        'PARTNER_KEY',
        transactionNo
      );
    }

    const locationData = await findLocationStoreCodeData(locationCode);

    if (!locationData) {
      return encryptAndRespondAutoEntry(
        ERROR_MESSAGES.INVALID_LOCATION,
        'PARTNER_KEY',
        transactionNo
      );
    }

    const expectedSignature = generateAutoEntrySignature(
      login,
      password,
      transactionNo,
      licensePlateNo,
      locationCode,
      locationData.SecretKey || ''
    );

    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return encryptAndRespondAutoEntry(
        ERROR_MESSAGES.INVALID_SIGNATURE,
        locationData.GibberishKey || '',
        transactionNo
      );
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data_token = qs.stringify({
      grant_type: ACCESS_CREDENTIAL.grant_type,
      username: ACCESS_CREDENTIAL.username,
      password: ACCESS_CREDENTIAL.password
    });

    const get_token = await axios.post(EnvConfig.URL_TOKEN, data_token, {
      headers,
      timeout: 3000
    });

    if (get_token.status !== 200) {
      return encryptAndRespondAutoEntry(
        ERROR_ON_LIPPO_MALLS.FAILED_TO_GET_TOKEN,
        locationData.GibberishKey || '',
        transactionNo
      );
    }

    const send_data = {
      LicenseNumber: licensePlateNo,
      ParkingTicket: `https://billing.skyparking.online/Ebilling?p1=${locationData.NMID}&p2=${transactionNo}`,
      Location: locationData.CompanyName
    };

    const headers_auto_entry = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${get_token.data.access_token}`
    };

    const validate_entry = await axios.post(
      EnvConfig.URL_AUTO_ENTRY,
      send_data,
      {
        headers: headers_auto_entry,
        timeout: 3000
      }
    );

    // Save log to DB
    await createStylesCheckMembership({
      CompanyName: locationData.CompanyName,
      NMID: locationData.NMID,
      LocationCode: locationData.StoreCode,
      TransactionNo: transactionNo,
      LicensePlateNo: licensePlateNo,
      QRTicket: send_data.ParkingTicket,
      ResponseCode: validate_entry.data.Code,
      ResponseStatus: validate_entry.data.Code === '200' ? 1 : 0,
      MerchantDataRequest: JSON.stringify(send_data),
      MerchantDataResponse: JSON.stringify(validate_entry.data),
      POSTDataRequest: JSON.stringify(decryptedObject),
      POSTDataResponse: '',
      RecordStatus: 1,
      CreatedBy: 'AUTO_ENTRY',
      CreatedOn: new Date()
    });

    if (validate_entry.data.Code === '404') {
      return encryptAndRespondAutoEntry(
        ERROR_ON_LIPPO_MALLS.NOT_MEMBER_STYLES,
        locationData.GibberishKey || '',
        transactionNo
      );
    }

    if (validate_entry.data.Code === '200') {
      const res_final = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail:
          'The vehicle license plate is registered as valid Styles membership',
        data: {
          transactionNo,
          licensePlateNo,
          locationCode,
          customerEmail: validate_entry.data.EmailHide,
          status: 'VALID'
        }
      };

      return encryptAndRespondAutoEntry(
        res_final,
        locationData.GibberishKey ?? '',
        transactionNo
      );
    }
  } catch (error) {
    console.error('[AUTO_ENTRY ERROR]', error);
    return res.status(500).json({
      data: RealencryptPayload({ error: 'Internal Server Error' })
    });
  }
}
