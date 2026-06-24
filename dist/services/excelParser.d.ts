export declare class ExcelParser {
    /**
     * Lee un archivo Excel y devuelve los datos como array de arrays
     */
    static parseExcel(filePath: string): Promise<any[][]>;
    /**
     * Valida que el Excel tenga los encabezados correctos
     */
    static validateHeaders(data: any[][], expectedHeaders: string[]): boolean;
    /**
     * Obtiene los encabezados del Excel
     */
    static getHeaders(data: any[][]): string[];
    /**
     * Obtiene los datos sin encabezados
     */
    static getDataRows(data: any[][]): any[][];
}
