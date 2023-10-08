import { env } from "src/env/env";
import { EbayRequest } from "../ebay.request";
import { EbayService } from "../ebay.service";
import { PublicEbayKeyDto } from "src/dto/ebay/publicEbayKey.dto";
import { createHash } from "crypto";

const crypto = require('crypto');
export const validateSignature = async (message, sigHeader, ebay_Service: EbayService) => {
    try {   
        const jsonHeader = getJsonHeaderEbaySignature(sigHeader);
        let public_key: PublicEbayKeyDto | null;
        if(ebay_Service.ebay_public_key && ebay_Service.ebay_public_key_time > Date.now()) {
            public_key = ebay_Service.ebay_public_key;
        } else {
            public_key = await getPublicKey(jsonHeader.kid, ebay_Service);
            ebay_Service.ebay_public_key = public_key;
            ebay_Service.ebay_public_key_time = Date.now() + 3600000;
        }


 
        const verifier = crypto.createVerify('ssl3-sha1');

     
        verifier.update(JSON.stringify(message));
      
        return verifier.verify(formatKey(public_key.key),
            jsonHeader.signature, 'base64');

    } catch (err) {
        console.log(err);
        return err;
    }
}
export const getJsonHeaderEbaySignature = (header) => {
    const buffer = Buffer.from(header, 'base64');
    try {
        return JSON.parse(buffer.toString('ascii'));
    } catch (err) 
    {
        return new Error(`Parsing falied for signature header ${header}`);
    }
}
export const getPublicKey = async (keyid, ebay_Service: EbayService) => {
    try {
        await ebay_Service.checkAccessToken();
        if(!ebay_Service.currentToken)
         throw new Error(`GetPublicKey cant get access token! `);

    const request = new EbayRequest;
    const key = await request.getRequest(env.ebay_publicKey_api+keyid, ebay_Service.currentToken.access_token);
    return key;
    } catch (err) {
        console.log(err)
        return new Error('Ebay get public key failed');
    }
}
const formatKey = (key) => {
    try {
       return `-----BEGIN PUBLIC KEY-----\n${key.split('-----')[2]}\n-----END PUBLIC KEY-----`;
    } catch (exception) {
        return new Error(`Invalid key format`);
    }
};
export const verifyChalange = async (chalngeCode: string, endpoint: string, verCode: string) => {

    const hash = createHash('sha256');
    hash.update(chalngeCode);
    hash.update(verCode);
    hash.update(endpoint);
    const resHash = hash.digest('hex');
    return resHash.toString();
}