import { EbayService } from "../ebay.service";
import { validateSignature } from "./ebay.notValidator";

export const ebayProccess = async (message, signature, ebay_Service: EbayService) => {
    if (!message || !message.metadata || !message.notification) throw new Error('Please provide the message.');
    if (!signature) throw new Error('Please provide the signature.');
    
    const response = await validateSignature(message, signature, ebay_Service);
   
    if(response) {
            if(message.metadata.topic !== 'MARKETPLACE_ACCOUNT_DELETION')
                //TODO: process message  
        //NO_CONTENT 
        return 204;
    }
    //PRECONDITION_FAILED
    return 412;
}