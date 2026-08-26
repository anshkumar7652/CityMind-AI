import { gps } from 'exifr';

/**
 * Extract GPS coordinates from an image File object.
 * Returns { latitude, longitude } or null.
 *
 * Privacy: Only reads the GPS IFD block via exifr.gps().
 * No camera model, serial number, date/time, or device info is extracted.
 */
export async function extractGpsFromImage(file) {
  try {
    if (!file || !(file instanceof File)) {
      return null;
    }

    const coords = await gps(file);

    if (!coords || coords.latitude == null || coords.longitude == null) {
      return null;
    }

    const { latitude, longitude } = coords;

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return null;
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    // Malformed image, unsupported format, or EXIF parsing error — fail silently
    return null;
  }
}