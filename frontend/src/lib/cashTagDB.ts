import { GoogleSheetsService } from './googleSheetsService';

export const DB_FILENAME = 'cash-tag-db.csv';

export interface SheetConfig {
    title: string;
    headers: string[];
}

export const SHEETS_CONFIG: SheetConfig[] = [
    { title: 'transactions', headers: ['id', 'date', 'amount', 'entryType', 'categoryId', 'subcategoryId', 'sourceId', 'peopleIds', 'createdAt', 'note'] },
    { title: 'accounts', headers: ['id', 'name', 'type', 'createdAt'] },
    { title: 'person', headers: ['id', 'name', 'relation', 'createdAt'] },
    { title: 'category', headers: ['id', 'name', 'entryType', 'color', 'createdAt'] },
    { title: 'subcategory', headers: ['id', 'parentCategoryId', 'name', 'createdAt'] }
];

export class CashTagDB {
    private service: GoogleSheetsService;

    constructor(accessToken: string) {
        this.service = new GoogleSheetsService(accessToken);
    }

    /**
     * Checks if the database spreadsheet exists in the user's Drive.
     */
    async checkDatabaseExists(): Promise<string | null> {
        return this.service.findFile(DB_FILENAME);
    }

    /**
     * Verifies if a spreadsheet has all the required sheets.
     */
    async verifyDatabase(spreadsheetId: string): Promise<boolean> {
        try {
            const spreadsheet = await this.service.getSpreadsheet(spreadsheetId);
            const sheetTitles = spreadsheet.sheets.map((s: any) => s.properties.title);
            return SHEETS_CONFIG.every(config => sheetTitles.includes(config.title));
        } catch (error) {
            console.error('Database verification failed:', error);
            return false;
        }
    }

    /**
     * Creates the database and initializes it step-by-step.
     * onProgress is called with the name of the sheet being created/initialized.
     */
    async initializeDatabase(onProgress: (step: string, progress: number) => void): Promise<string> {
        onProgress('Creating spreadsheet...', 10);
        const spreadsheetId = await this.service.createSpreadsheet(DB_FILENAME);

        // Get current sheets (usually one default sheet is created)
        const spreadsheet = await this.service.getSpreadsheet(spreadsheetId);
        const existingTitles = spreadsheet.sheets.map((s: any) => s.properties.title);

        // Filter sheets to add (skip 'Sheet1' if it exists or add our ones)
        const itemsToAdd = SHEETS_CONFIG.filter(config => !existingTitles.includes(config.title));

        if (itemsToAdd.length > 0) {
            onProgress(`Adding ${itemsToAdd.length} sheets...`, 30);
            await this.service.addSheets(spreadsheetId, itemsToAdd.map(i => i.title));
        }

        // Initialize headers for all sheets
        const totalSteps = SHEETS_CONFIG.length;
        for (let i = 0; i < SHEETS_CONFIG.length; i++) {
            const config = SHEETS_CONFIG[i];
            const progress = Math.round(40 + ((i + 1) / totalSteps) * 60);
            onProgress(`Initializing headers for ${config.title}...`, progress);
            await this.service.batchUpdateValues(spreadsheetId, [
                {
                    range: `${config.title}!A1`,
                    values: [config.headers]
                }
            ]);
        }

        onProgress('Done!', 100);
        return spreadsheetId;
    }

    getSpreadsheetUrl(spreadsheetId: string): string {
        return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    }
}
