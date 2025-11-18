// Helper para parsear el texto de un QR y extraer Documento, Serial y Nombre
export function parseQRText(qrText) {
  const parsed = { documento: null, serial: null, nombre: null };
  if (!qrText || typeof qrText !== 'string') return parsed;

  const text = qrText;
  const docMatch = text.match(/Documento:\s*([^|\n]+)/i);
  const equipoMatch = text.match(/(?:Equipo|Serial):\s*([^\n]+)/i);
  const nombreMatch = text.match(/Nombre:\s*([^\n]+)/i);

  if (docMatch) parsed.documento = docMatch[1].trim();
  if (equipoMatch) parsed.serial = equipoMatch[1].trim();
  if (nombreMatch) parsed.nombre = nombreMatch[1].trim();

  // Fallback por líneas
  const lines = qrText.split('\n');
  lines.forEach(line => {
    if (line.includes('Documento:')) {
      const after = line.split('Documento:')[1];
      if (after) parsed.documento = after.split('|')[0].trim();
    }
    if (line.includes('Equipo:')) {
      parsed.serial = line.split('Equipo:')[1]?.trim() || parsed.serial;
    }
    if (line.includes('Serial:')) {
      parsed.serial = line.split('Serial:')[1]?.trim() || parsed.serial;
    }
    if (line.includes('Nombre:')) {
      parsed.nombre = line.split('Nombre:')[1]?.trim() || parsed.nombre;
    }
  });

  return parsed;
}
