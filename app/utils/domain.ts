//import process from "node:process";
import { isProduction } from "@/utils/environment";

/**
 * Returns the API base URL based on the current environment.
 * In production it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to a hardcoded url).
 * In development, it returns "http://localhost:8080".
 */
export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://automatic-bond-454109-v8.oa.r.appspot.com";
  const devUrl = "http://localhost:8080";
  return isProduction() ? prodUrl : devUrl;
}

export function getWSDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_WS_URL ||
    "wss://automatic-bond-454109-v8.oa.r.appspot.com";
  const devUrl = "ws://localhost:8080";
  return isProduction() ? prodUrl : devUrl;
}
