declare module "apn-format-js" {
  export function modifyInput(input: string | undefined): string | false;

  export function verifyState(state: string): string;

  export function lookup(state: string, county?: string): any;

  export function validate(apn_input: string, state: string, county: string): boolean;

  export function format(apn_input: string, state: string, county: string): string | null;
}