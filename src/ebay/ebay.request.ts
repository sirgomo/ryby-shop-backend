import { EbayApplicationAccessTokenDto } from "src/dto/ebay/ebayApplicationAccessToken.dto";

export class EbayRequest {
    async sendRequest(endpoint: string, method: string, token: string, plusHeaders, body): Promise<EbayApplicationAccessTokenDto> {
      const  headers = {
            'Authorization': token,
            ...plusHeaders
        }
      try {
        const res = await fetch(endpoint, {
            headers: headers,
            method: method,
            body: body,
        });
        return res.json();
      } catch (err) {
        console.log( err)
      }
        
    }
    async getRequest(endpoint: string, token) {
      
      const  headers = {
        'Accept': 'application/json',
        'Authorization': 'Bearer '+ token
    }
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
  
}
export const base64Encode = (encodeData) => {
    const buff = Buffer.from(encodeData);
    return buff.toString('base64');
};
