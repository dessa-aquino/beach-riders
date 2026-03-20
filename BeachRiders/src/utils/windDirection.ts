export function degreesToCardinal(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function beaufortScale(speedKmh: number): string {
  if (speedKmh < 1) return 'Calm';
  if (speedKmh < 6) return 'Light air';
  if (speedKmh < 12) return 'Light breeze';
  if (speedKmh < 20) return 'Gentle breeze';
  if (speedKmh < 29) return 'Moderate breeze';
  if (speedKmh < 39) return 'Fresh breeze';
  if (speedKmh < 50) return 'Strong breeze';
  if (speedKmh < 62) return 'Near gale';
  if (speedKmh < 75) return 'Gale';
  if (speedKmh < 89) return 'Strong gale';
  if (speedKmh < 103) return 'Storm';
  return 'Violent storm';
}
