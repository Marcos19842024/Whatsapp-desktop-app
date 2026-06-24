"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelParser = void 0;
const XLSX = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
class ExcelParser {
    /**
     * Lee un archivo Excel y devuelve los datos como array de arrays
     */
    static async parseExcel(filePath) {
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
            const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            return data;
        }
        catch (error) {
            console.error(`Error al leer el archivo Excel ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Valida que el Excel tenga los encabezados correctos
     */
    static validateHeaders(data, expectedHeaders) {
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
    static getHeaders(data) {
        if (!data || data.length === 0) {
            return [];
        }
        return data[0].map(h => h?.toString() || '');
    }
    /**
     * Obtiene los datos sin encabezados
     */
    static getDataRows(data) {
        if (!data || data.length < 2) {
            return [];
        }
        return data.slice(1);
    }
}
exports.ExcelParser = ExcelParser;
//# sourceMappingURL=excelParser.js.map