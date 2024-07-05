import { EbayApplicationAccessTokenDto } from 'src/dto/ebay/ebayApplicationAccessToken.dto';
import { check_signature, setConfig } from './ebay_signature/signature';
import { needsContentDigestValidation } from './ebay_signature/helpers/common';
import { generateDigestHeader } from './ebay_signature/helpers/digest-helper';
import { Config } from './ebay_signature/types/Config';
import { constants } from './ebay_signature/constants';
import { generateSignature, generateSignatureInput, validateSignatureHeader } from './ebay_signature/helpers/signature-helper';

export class EbayRequest {
  async sendRequest(
    endpoint: string,
    method: string,
    token: string,
    plusHeaders,
    body,
  ): Promise<EbayApplicationAccessTokenDto> {
    const headers = {
      Authorization: token,
      ...plusHeaders,
    };
    try {
      const res = await fetch(endpoint, {
        headers: headers,
        method: method,
        body: body,
      });
      return res.json();
    } catch (err) {
      console.log(err);
    }
  }
  async getRequest(endpoint: string, token) {
    const headers = {
      Accept: 'application/json',
      'Accept-Language': 'de-DE',
      'Accept-Encoding': 'application/gzip',
      Authorization: 'Bearer ' + token,
    };
    try {
      const res = await fetch(endpoint, {
        headers: headers,
        method: 'GET',
      });
      return res.json();
    } catch (err) {
      return err;
    }
  }
  async getFinanzeRequest(endpoint: string, token: string, method: string, config: Config, body? : string) {

    const sig = await check_signature(token);
    
    if(sig[0] === undefined || sig[0] === null)
      return;
    
    setConfig(config, sig, method, endpoint);
    config.signatureParams = [
      "x-ebay-signature-key",
      "@method",
      "@path",
      "@authority"
    ];
 

    const headers = {
      Authorization: 'Bearer ' + token,
      'x-ebay-c-marketplace-id': 'EBAY_DE',
      Accept: 'application/json',
      'Content-Type':  'application/json',
    };
    
    if (needsContentDigestValidation(body)) {
      const contentDigest = generateDigestHeader(
          Buffer.from(body, 'utf8'),
          config.digestAlgorithm
      );
      headers[constants.HEADERS.CONTENT_DIGEST] = contentDigest;
      config.signatureParams = [
        "content-digest",
        "x-ebay-signature-key",
        "@method",
        "@path",
        "@authority"
      ];
    }
   
    const signatureInput = generateSignatureInput(headers, config);
    headers[constants.HEADERS.SIGNATURE_INPUT] = signatureInput;
    headers[constants.HEADERS.SIGNATURE_KEY] = config.jwe;
    const signature = generateSignature( headers, config);
    headers[constants.HEADERS.SIGNATURE] = signature;
    
    try {
      const res = await fetch(endpoint, {
        headers: headers,
        method: method,
      });
      
      return res.json();
    } catch (err) {
      return err;
    }
  }


  async sendRequestXml(
    endpoint: string,
    method: string,
    plusHeaders,
    body,
  ): Promise<any> {
    const headers = {
      ...plusHeaders,
    };
    try {
      const res = await fetch(endpoint, {
        headers: headers,
        method: method,
        body: body,
      });
      const data = await res.text();
      return data;
    } catch (err) {
      console.log(err);
    }
  }
  async sendCreateUpdateRequest(
    endpoint: string,
    method: string,
    token: string,
    plusHeaders,
    body,
  ): Promise<[any, number]> {
    const headers = {
      Authorization: 'Bearer ' + token,
      ...plusHeaders,
    };
    try {
      const res = await fetch(endpoint, {
        headers: headers,
        method: method,
        body: body,
      });

      return [res, res.status];
    } catch (err) {
      console.log(err);
    }
  }
}
export const base64Encode = (encodeData) => {
  const buff = Buffer.from(encodeData);
  return buff.toString('base64');
};
