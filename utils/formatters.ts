
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseCSV = (text: string, platform: 'meta' | 'google') => {
  const allLines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (allLines.length < 2) return [];

  // 1. Detectar delimitador (Soporte para ";" y ",")
  const firstLine = allLines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const splitLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // 2. Buscar la fila de encabezados
  let headerRowIndex = -1;
  const campaignKeywords = ['campaign', 'campaña', 'campana', 'nombre de la'];
  
  for (let i = 0; i < Math.min(allLines.length, 25); i++) {
    const lowerLine = allLines[i].toLowerCase();
    if (campaignKeywords.some(kw => lowerLine.includes(kw))) {
      headerRowIndex = i;
      break;
    }
  }

  // Fallback: si no encuentra, asume que es la primera fila
  if (headerRowIndex === -1) headerRowIndex = 0;

  const headers = splitLine(allLines[headerRowIndex]).map(h => 
    h.replace(/^"|"$/g, '').trim().toLowerCase()
  );
  
  // 3. Lógica de detección de columnas ultra-flexible
  const findColumn = (keywords: string[], avoid: string[] = []) => {
    return headers.findIndex(h => {
      const matches = keywords.some(k => h.includes(k));
      const excluded = avoid.some(a => h.includes(a));
      return matches && !excluded;
    });
  };

  // Nombres de campaña
  const nameIdx = findColumn(['campaign name', 'nombre de la', 'campaña', 'campana']);
  
  // Gasto (Importe Gastado) - Muy flexible para detectar "gastado", "spent", "cost", "invers"
  let spendIdx = findColumn(['gastad', 'spent', 'invers', 'amount'], ['por', 'per', 'costo por', 'cost per']);
  
  // Si no encuentra por nombre, buscar columna que contenga "(clp)"
  if (spendIdx === -1) spendIdx = findColumn(['(clp)']);
  
  // Si sigue sin encontrar, buscar "costo" o "cost" que NO sea "por resultado"
  if (spendIdx === -1) spendIdx = findColumn(['costo', 'cost', 'coste'], ['por', 'per', 'conv']);

  // Resultados / Conversiones
  const resultsIdx = findColumn(['results', 'resultados', 'conversiones', 'acciones'], ['por', 'per', 'costo', 'cost']);
  
  // Alcance e Impresiones
  const reachIdx = findColumn(['reach', 'alcance']);
  const impressionsIdx = findColumn(['impressions', 'impresiones', 'impr.']);

  // 4. Limpieza numérica estricta para CLP
  const cleanNumber = (val: string): number => {
    if (!val || val === '--' || val === '') return 0;
    
    // Quitar comillas, moneda y espacios
    let cleaned = val.replace(/^"|"$/g, '').trim();
    cleaned = cleaned.replace(/[a-zA-Z$]/g, '').trim();

    if (cleaned === '') return 0;

    // Lógica para CLP:
    // Si el número es algo como "208.562" (punto como miles), quitamos el punto.
    // Si el número es "1.234,56", quitamos el punto y cambiamos la coma por punto decimal.
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');

    if (hasComma && hasDot) {
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        // Formato 1.234,56
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato 1,234.56
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (hasComma) {
      // En Chile la coma suele ser decimal, pero en CLP no hay decimales. 
      // Si hay 3 dígitos después de la coma, suele ser separador de miles.
      const parts = cleaned.split(',');
      if (parts[parts.length - 1].length === 3) {
        cleaned = cleaned.replace(/,/g, '');
      } else {
        cleaned = cleaned.replace(',', '.');
      }
    } else if (hasDot) {
      // Caso común CLP: 208.562 -> 208562
      const parts = cleaned.split('.');
      if (parts[parts.length - 1].length === 3 || parts.length > 2) {
        cleaned = cleaned.replace(/\./g, '');
      }
    }

    const result = parseFloat(cleaned);
    return isNaN(result) ? 0 : result;
  };

  // 5. Procesar y filtrar
  return allLines.slice(headerRowIndex + 1)
    .map(line => splitLine(line))
    .filter(values => {
      const name = values[nameIdx]?.toLowerCase() || '';
      // Evitar filas vacías o resúmenes
      return name && !name.includes('total') && !name.includes('resumen') && name.trim() !== '';
    })
    .map((values, idx) => {
      const spend = cleanNumber(values[spendIdx]);
      const results = cleanNumber(values[resultsIdx]);
      
      return {
        id: `c-${idx}`,
        name: values[nameIdx] ? values[nameIdx].replace(/^"|"$/g, '') : 'Campaña sin nombre',
        spend,
        results,
        costPerResult: results > 0 ? spend / results : 0,
        reach: cleanNumber(values[reachIdx]),
        impressions: cleanNumber(values[impressionsIdx]),
        status: 'Active'
      };
    });
};
