import { LOGS_CLASS } from 'src/entity/logsEntity';

export class AcctionLogsDto {
  id?: number;
  ebay_transaction_id?: string;
  user_email?: string;
  paypal_transaction_id?: string;
  error_class: LOGS_CLASS;
  error_message: string;
  created_at?: Date;
}
