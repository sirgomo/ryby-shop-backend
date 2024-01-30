import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { EbayService } from '../ebay.service';
import { validateSignature } from './ebay.notValidator';
import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { LOGS_CLASS } from 'src/entity/logsEntity';

export const ebayProccess = async (
  message,
  signature,
  ebay_Service: EbayService,
  logs_service: LogsService,
) => {
  if (!message || !message.metadata || !message.notification)
    throw new Error('Please provide the message.');
  if (!signature) throw new Error('Please provide the signature.');

  const response = await validateSignature(message, signature, ebay_Service);

  if (response) {
    if (message.metadata.topic !== 'MARKETPLACE_ACCOUNT_DELETION') {
      const newLog: AcctionLogsDto = {
        error_class: LOGS_CLASS.EBAY,
        error_message: message,
        created_at: new Date(Date.now()),
      };
      await logs_service.saveLog(newLog);
      return 204;
    }
    //TODO: process message
    //NO_CONTENT
    return 204;
  }
  //PRECONDITION_FAILED
  const newLog: AcctionLogsDto = {
    error_class: LOGS_CLASS.EBAY_ERROR,
    error_message: message,
    created_at: new Date(Date.now()),
  };
  await logs_service.saveLog(newLog);
  return 412;
};
