import * as XLSX from 'xlsx';
import * as fs from 'fs';

export class ExcelParser {
    /**
     * Lee un archivo Excel y devuelve los datos como array de arrays
     */
    static async parseExcel(filePath: string): Promise<any[][]> {
        try {
            // Verificar que el archivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error(`El archivo ${filePath} no existe`);
            }

            // Leer el archivo
            const workbook = XLSX.readFile(filePath);
            
            // Obtener la primera hoja
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convertir a JSON (sheet_to_json devuelve unknown[] en typings, casteamos a any[][] )
            const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
            
            return data;
        } catch (error) {
            console.error(`Error al leer el archivo Excel ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Valida que el Excel tenga los encabezados correctos
     */
    static validateHeaders(data: any[][], expectedHeaders: string[]): boolean {
        if (!data || data.length === 0) {
            return false;
        }

        const headers = data[0];
        
        if (headers.length < expectedHeaders.length) {
            return false;
        }

        return expectedHeaders.every((expected, index) => {
            const actual = headers[index]?.toString().trim().toUpperCase() || '';
            return actual === expected.toUpperCase();
        });
    }

    /**
     * Obtiene los encabezados del Excel
     */
    static getHeaders(data: any[][]): string[] {
        if (!data || data.length === 0) {
            return [];
        }
        return data[0].map(h => h?.toString() || '');
    }

    /**
     * Obtiene los datos sin encabezados
     */
    static getDataRows(data: any[][]): any[][] {
        if (!data || data.length < 2) {
            return [];
        }
        return data.slice(1);
    }
}