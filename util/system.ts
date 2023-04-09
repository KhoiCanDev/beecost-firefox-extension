export const DEFAULT_PRICE_FORMATTER = Intl.NumberFormat("vi-VN").format

export function isDarkModeSystem() {
  let darkMode = false
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    darkMode = true
  }
  return darkMode
}
