export class EbayApplicationAccessTokenDto {
  access_token: string | null = null;
  refresh_token: string | null = null;
  refresh_token_expires_in: number | null = null;
  expires_in: number;
  token_type: string;
}
