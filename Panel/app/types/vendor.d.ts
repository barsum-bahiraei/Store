declare module "moment-jalali" {
  export interface JalaliMoment {
    format(format?: string): string;
    clone(): JalaliMoment;
    isValid(): boolean;
    isSame(other?: JalaliMoment, unit?: string): boolean;
    add(amount: number, unit: string): JalaliMoment;
    subtract(amount: number, unit: string): JalaliMoment;
  }

  interface MomentJalaliFactory {
    (input?: string | number | Date | null, format?: string): JalaliMoment;
    loadPersian(options?: { usePersianDigits?: boolean; dialect?: string }): void;
  }

  const momentJalali: MomentJalaliFactory;
  export default momentJalali;
}

declare module "react-persian-datepicker/lib/utils/persian" {
  export function persianNumber(input: string | number): string;
}

declare module "react-persian-datepicker/lib/utils/moment-helper" {
  import type { JalaliMoment } from "moment-jalali";

  export function getDaysOfMonth(month: JalaliMoment): JalaliMoment[];
}
