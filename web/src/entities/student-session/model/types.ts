/** Сесія учня без повноцінного акаунта (чекліст: PIN + ПІБ). */
export interface StudentSession {
  displayName: string;
  pin: string;
  attemptId?: string;
}
