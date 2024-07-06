import { Config } from "./types/Config";

var fs = require('fs');


export async function check_signature(token: string) {
    try {

       
        if(!fs.existsSync(__dirname + '/ebay_public_key.pem')) {
           return await createSignature(token);
        }
        
        let ebay_public_key = fs.readFileSync(__dirname + '/ebay_public_key.pem', { encoding: 'utf8', flag: 'r' });;
        let ebay_private_Key = fs.readFileSync(__dirname + '/ebay_private_key.pem', { encoding: 'utf8', flag: 'r' });
        let ebay_jwe = fs.readFileSync(__dirname + '/ebay_jwe', { encoding: 'utf8', flag: 'r' });

        
        return [ebay_public_key, ebay_private_Key, ebay_jwe];
    } catch (err) {
        throw err;
    } 
}
async function createSignature(token: string) {
 
     const res = await fetch('https://apiz.ebay.com/developer/key_management/v1/signing_key', {
        headers:   {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
           },
        method: 'POST',
        body: JSON.stringify({"signingKeyCipher": "ED25519"})
      });
       
        
   
    const requst = await res.json();
  
    try {
        let pemPubKey = '';
        let pemKey = '';
        if(requst.publicKey && requst.privateKey && requst.jwe) {
           
            const pemPubHeader = "-----BEGIN PUBLIC KEY-----";
            const pemPubFooter = "-----END PUBLIC KEY-----";
            const keyPubData = requst.publicKey.match(/.{1,64}/g).join('\n');
            pemPubKey = `${pemPubHeader}\n${keyPubData}\n${pemPubFooter}`;
            fs.writeFileSync(__dirname + '/ebay_public_key.pem', pemPubKey, { encoding: 'utf8' });
            const pemHeader = "-----BEGIN PRIVATE KEY-----";
            const pemFooter = "-----END PRIVATE KEY-----";
            const keyData = requst.privateKey.match(/.{1,64}/g).join('\n');
            pemKey = `${pemHeader}\n${keyData}\n${pemFooter}`;
            fs.writeFileSync(__dirname + '/ebay_private_key.pem', pemKey, { encoding: 'utf8' });
            fs.writeFileSync(__dirname + '/ebay_jwe', requst.jwe, { encoding: 'utf8' });

        }

        return [pemPubKey, pemKey, requst.jwe];
    } catch (err) {
        throw err;
    }
}
export function getPathWithQuery(url: string) {
    const urlObj = new URL(url);
    return urlObj.pathname;

}
export function getHost(url: string) {
    const urlObj = new URL(url);
    return urlObj.host;

}
export function setConfig(config: Config, sig: any[], method: string, endpoint: string) {
    config.jwe = sig[2];
    config.privateKey = sig[1];
    config.publicKey = sig[0];
    config.jwtExpiration = 3;
    config.digestAlgorithm = 'sha256';
    config.signatureComponents = {
      "method": method,
      "authority": getHost(endpoint),
      "path": getPathWithQuery(endpoint),
      "targetUri": endpoint,
      "scheme": "https",
    } as any;
  
  }
