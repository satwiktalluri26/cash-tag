/**
 * Service for direct Google Sheets and Drive API interactions.
 */
export class GoogleSheetsService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private async fetchGoogleApi(url: string, options: RequestInit = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Google API Error: ${url}`, errorData);
            throw new Error(errorData.error?.message || `Failed to fetch from Google API: ${url}`);
        }

        return response.json();
    }

    /**
     * Searches for a file in Google Drive by name.
     */
    async findFile(name: string): Promise<string | null> {
        const q = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
        const data = await this.fetchGoogleApi(`https://www.googleapis.com/drive/v3/files?q=${q}`);

        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        }
        return null;
    }

    /**
     * Creates a new spreadsheet.
     */
    async createSpreadsheet(title: string): Promise<string> {
        const data = await this.fetchGoogleApi('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            body: JSON.stringify({
                properties: { title },
            }),
        });
        return data.spreadsheetId;
    }

    /**
     * Gets spreadsheet details.
     */
    async getSpreadsheet(spreadsheetId: string) {
        return this.fetchGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);
    }

    /**
     * Batch updates values in multiple ranges.
     */
    async batchUpdateValues(spreadsheetId: string, data: { range: string; values: any[][] }[]) {
        return this.fetchGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({
                valueInputOption: 'RAW',
                data,
            }),
        });
    }

    /**
     * Adds multiple sheets to a spreadsheet.
     */
    async addSheets(spreadsheetId: string, titles: string[]) {
        const requests = titles.map(title => ({
            addSheet: {
                properties: { title },
            },
        }));

        return this.fetchGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({ requests }),
        });
    }

    /**
     * Gets values from a specific range.
     */
    async getValues(spreadsheetId: string, range: string): Promise<any[][]> {
        const data = await this.fetchGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`);
        return data.values || [];
    }

    /**
     * Appends values to a specific range.
     */
    async appendValues(spreadsheetId: string, range: string, values: any[][]) {
        return this.fetchGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`, {
            method: 'POST',
            body: JSON.stringify({
                values,
            }),
        });
    }
}
