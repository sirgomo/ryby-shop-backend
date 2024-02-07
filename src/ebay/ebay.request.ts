import { EbayApplicationAccessTokenDto } from 'src/dto/ebay/ebayApplicationAccessToken.dto';

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
