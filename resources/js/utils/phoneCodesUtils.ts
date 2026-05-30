import { Country, State } from "country-state-city";
import type { Option } from "../components/common-select/commonSelect";

export interface CountryOption extends Option {
  phoneCode: string;
  isoCode:   string;
}

export interface PhoneCodesResult {
  options:    Option[];
  maxLengths: Record<string, number>;
  countries:  CountryOption[];
}

// Build the full list from the local country-state-city package (no network needed)
function buildCountriesSync(): CountryOption[] {
  return Country.getAllCountries()
    .map((c) => ({
      value:     c.name,
      label:     c.name,
      phoneCode: "+" + c.phonecode.replace(/\+/g, ""),
      isoCode:   c.isoCode,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// 5 common defaults shown immediately before the full list is ready
export const DEFAULT_COUNTRIES: CountryOption[] = [
  { value: "India",                label: "India",                phoneCode: "+91",  isoCode: "IN" },
  { value: "United States",        label: "United States",        phoneCode: "+1",   isoCode: "US" },
  { value: "United Kingdom",       label: "United Kingdom",       phoneCode: "+44",  isoCode: "GB" },
  { value: "United Arab Emirates", label: "United Arab Emirates", phoneCode: "+971", isoCode: "AE" },
  { value: "Singapore",            label: "Singapore",            phoneCode: "+65",  isoCode: "SG" },
];

export const DEFAULT_PHONE_CODES: Option[] = DEFAULT_COUNTRIES.map((c) => ({
  value: c.phoneCode,
  label: `${c.label} (${c.phoneCode})`,
}));

async function buildPhoneCodes(): Promise<PhoneCodesResult> {
  const countries = buildCountriesSync();

  // Deduplicate phone codes (multiple countries can share the same dial code)
  const seen = new Set<string>();
  const options: Option[] = [];
  for (const c of countries) {
    if (!seen.has(c.phoneCode)) {
      seen.add(c.phoneCode);
      options.push({ value: c.phoneCode, label: `${c.label} (${c.phoneCode})` });
    }
  }
  options.sort((a, b) => {
    const numA = parseInt(a.value.replace("+", ""), 10);
    const numB = parseInt(b.value.replace("+", ""), 10);
    return numA - numB || a.label.localeCompare(b.label);
  });

  // Max phone lengths via libphonenumber-js
  const maxLengths: Record<string, number> = {};
  try {
    const [libPhone, examplesModule] = await Promise.all([
      import("libphonenumber-js"),
      import("libphonenumber-js/examples.mobile.json"),
    ]);
    const { getExampleNumber } = libPhone;
    const examplesData = (examplesModule as any).default ?? examplesModule;

    for (const c of countries) {
      if (!maxLengths[c.phoneCode]) {
        try {
          const ex = getExampleNumber(c.isoCode as any, examplesData);
          if (ex) maxLengths[c.phoneCode] = ex.nationalNumber.length;
        } catch { /* keep default */ }
      }
    }
  } catch { /* proceed without max lengths */ }

  return { options, maxLengths, countries };
}

let _cache:   PhoneCodesResult           | null = null;
let _promise: Promise<PhoneCodesResult>  | null = null;

export function getCachedPhoneCodes(): Promise<PhoneCodesResult> {
  if (_cache) return Promise.resolve(_cache);
  if (!_promise) {
    _promise = buildPhoneCodes()
      .then((r) => { _cache = r; return r; })
      .finally(() => { _promise = null; });
  }
  return _promise;
}

export function getCachedCountries(): Promise<CountryOption[]> {
  return getCachedPhoneCodes().then((r) => r.countries);
}

/** Returns states/regions for a country by ISO-2 code. Synchronous, no network. */
export function getStatesForCountry(isoCode: string): Option[] {
  return State.getStatesOfCountry(isoCode)
    .map((s) => ({ value: s.name, label: s.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
