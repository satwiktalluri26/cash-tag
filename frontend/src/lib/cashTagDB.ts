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

        onProgress('Adding default data...', 95);
        const meId = crypto.randomUUID();
        const cashId = crypto.randomUUID();

        await Promise.all([
            this.addPerson(spreadsheetId, {
                id: meId,
                name: 'Me',
                relation: 'Self',
                createdAt: new Date()
            }),
            this.service.appendValues(spreadsheetId, 'accounts!A1', [[
                cashId,
                'Cash Wallet',
                'CASH',
                new Date().toISOString()
            ]]),
            this.addCategory(spreadsheetId, {
                id: crypto.randomUUID(),
                name: 'Food & Dining',
                entryType: 'EXPENSE',
                color: '#ef4444',
                createdAt: new Date()
            })
        ]);

        onProgress('Done!', 100);
        return spreadsheetId;
    }

    getSpreadsheetUrl(spreadsheetId: string): string {
        return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    }

    // --- Data Fetching Methods ---

    async getTableData<T>(spreadsheetId: string, title: string, mapper: (row: any[]) => T): Promise<T[]> {
        const values = await this.service.getValues(spreadsheetId, `${title}!A:Z`);
        if (values.length <= 1) return []; // Only headers or empty
        return values.slice(1).map(mapper);
    }

    async getTransactions(spreadsheetId: string) {
        return this.getTableData(spreadsheetId, 'transactions', (row) => ({
            id: row[0],
            date: new Date(row[1]),
            amount: parseFloat(row[2]),
            entryType: row[3],
            categoryId: row[4],
            subcategoryId: row[5] || undefined,
            sourceId: row[6],
            peopleIds: row[7] ? row[7].split(',') : [],
            createdAt: new Date(row[8]),
            notes: row[9] || undefined
        }));
    }

    async getAccounts(spreadsheetId: string) {
        return this.getTableData(spreadsheetId, 'accounts', (row) => ({
            id: row[0],
            name: row[1],
            type: row[2],
            createdAt: new Date(row[3])
        }));
    }

    async getPeople(spreadsheetId: string) {
        return this.getTableData(spreadsheetId, 'person', (row) => ({
            id: row[0],
            name: row[1],
            relation: row[2],
            createdAt: new Date(row[3])
        }));
    }

    async getCategories(spreadsheetId: string) {
        return this.getTableData(spreadsheetId, 'category', (row) => ({
            id: row[0],
            name: row[1],
            entryType: row[2],
            color: row[3],
            createdAt: new Date(row[4])
        }));
    }

    async getSubcategories(spreadsheetId: string) {
        return this.getTableData(spreadsheetId, 'subcategory', (row) => ({
            id: row[0],
            parentCategoryId: row[1],
            name: row[2],
            createdAt: new Date(row[3])
        }));
    }

    // --- Data Persistence Methods ---

    async appendToTable(spreadsheetId: string, title: string, values: any[][]) {
        return this.service.appendValues(spreadsheetId, `${title}!A1`, values);
    }

    async addTransaction(spreadsheetId: string, transaction: any) {
        const row = [
            transaction.id,
            transaction.date.toISOString(),
            transaction.amount,
            transaction.entryType,
            transaction.categoryId,
            transaction.subcategoryId || '',
            transaction.sourceId,
            transaction.peopleIds.join(','),
            transaction.createdAt.toISOString(),
            transaction.notes || ''
        ];
        return this.appendToTable(spreadsheetId, 'transactions', [row]);
    }

    async addPerson(spreadsheetId: string, person: any) {
        const row = [
            person.id,
            person.name,
            person.relation,
            person.createdAt.toISOString()
        ];
        return this.appendToTable(spreadsheetId, 'person', [row]);
    }

    async addCategory(spreadsheetId: string, category: any) {
        const row = [
            category.id,
            category.name,
            category.entryType,
            category.color,
            category.createdAt.toISOString()
        ];
        return this.appendToTable(spreadsheetId, 'category', [row]);
    }
}
