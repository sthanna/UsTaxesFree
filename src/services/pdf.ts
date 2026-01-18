import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ReturnService } from './return';
import { CalculationResult } from '../engine/types';

export class PdfService {
    static async generate1040(userId: number, returnId: number): Promise<Uint8Array> {
        // 1. Fetch Return Data
        const taxReturn = await ReturnService.getReturnById(userId, returnId);

        // Ideally we would run the calculation again or fetch saved results.
        // For MVP, we'll re-calculate on the fly if needed, but optimally we should save the result blob.
        // We will assume the API route calls this AFTER calculation or passes the result. 
        // But to keep this service standalone, we might need to duplicate the calc call or fetch form lines directly.
        // Let's assume for now we just want to print what's in the DB columns for high-level summary, 
        // OR we re-run calculation. Re-running is safest.

        // Wait, to duplicate the logic from the route is messy.
        // Let's fetch the data needed for calculation using the same Service method logic if accessible, 
        // or easier, let the Route handle the data fetching and pass it here?
        // Patterns: Service should encapsulate logic. 
        // Let's make this method accept the `CalculationResult` object.

        throw new Error("Use generateFromCalculation instead.");
    }

    static async generateFromCalculation(result: CalculationResult, userDetails: { firstName?: string, lastName?: string, ssn?: string }): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let y = height - 50;
        const fontSize = 12;
        const lineHeight = 15;

        const drawText = (text: string, x: number, fontToUse = font) => {
            page.drawText(text, { x, y, size: fontSize, font: fontToUse, color: rgb(0, 0, 0) });
            y -= lineHeight;
        };

        const drawLine = () => {
            y -= 5;
            page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0, 0, 0) });
            y -= 15;
        };

        // Header
        page.drawText(`Tax Return Summary ${result.taxYear}`, { x: 50, y, size: 20, font: boldFont });
        y -= 30;

        drawText(`Filing Status: ${result.filingStatus}`, 50);
        drawText(`Taxpayer: ${userDetails.firstName} ${userDetails.lastName}`, 50);
        drawLine();

        // Income Section
        drawText('Income:', 50, boldFont);
        const incomeLines = result.lines.filter(l => l.form === '1040' && ['1z', '2b', '3b', '7', '8', '9', '11'].includes(l.lineNumber));
        incomeLines.forEach(l => {
            drawText(`${l.lineNumber} - ${l.description}: $${l.value.toLocaleString()}`, 70);
        });
        drawLine();

        // Deductions
        drawText('Deductions:', 50, boldFont);
        const dedLines = result.lines.filter(l => l.form === '1040' && ['12', '15'].includes(l.lineNumber));
        dedLines.forEach(l => {
            drawText(`${l.lineNumber} - ${l.description}: $${l.value.toLocaleString()}`, 70);
        });
        drawLine();

        // Tax & Credits
        drawText('Tax and Credits:', 50, boldFont);
        const taxLines = result.lines.filter(l => l.form === '1040' && ['16', '19', '24'].includes(l.lineNumber));
        taxLines.forEach(l => {
            drawText(`${l.lineNumber} - ${l.description}: $${l.value.toLocaleString()}`, 70);
        });
        drawLine();

        // Payments
        drawText('Payments:', 50, boldFont);
        const payLines = result.lines.filter(l => l.form === '1040' && ['25d', '26', '33'].includes(l.lineNumber));
        payLines.forEach(l => {
            drawText(`${l.lineNumber} - ${l.description}: $${l.value.toLocaleString()}`, 70);
        });
        drawLine();

        // Refund / Owed
        y -= 25; // Extra space
        if (result.refund > 0) {
            page.drawText(`REFUND: $${result.refund.toLocaleString()}`, { x: 50, y, size: 18, font: boldFont, color: rgb(0, 0.6, 0) });
        } else {
            page.drawText(`AMOUNT YOU OWE: $${result.amountOwed.toLocaleString()}`, { x: 50, y, size: 18, font: boldFont, color: rgb(0.8, 0, 0) });
        }

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }
}
