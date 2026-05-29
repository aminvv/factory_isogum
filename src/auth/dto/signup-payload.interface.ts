export interface AuthPayload {

  mobile: string;
  code: string;
}

export interface SendOtpCodePayload {
  mobile: string;
}
export interface VerifyOtpCodePayload {
  mobile: string;
  code: string;
  otpToken: string;
}



