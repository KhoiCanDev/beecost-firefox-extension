export interface PopupPrices {
  lowest: number;
  current: number;
  highest: number;
};

export function getDefaultPopupPrices(): PopupPrices {
  return {
    lowest: 0,
    current: 0,
    highest: 0,
  }
}