import { create } from 'xmlbuilder2';
import { CalculationResult } from '../engine/types';

export class MeFGenerator {
    static generate(result: CalculationResult, user: any): string {
        console.log('MeF Generator Input:', {
            hasResult: !!result,
            hasLines: !!result?.lines,
            linesLength: result?.lines?.length
        });

        const root = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('Return', {
                xmlns: 'http://www.irs.gov/efile',
                returnVersion: '2025v1.0'
            });

        // 1. Return Header
        const header = root.ele('ReturnHeader');
        header.ele('TaxYear').txt(result.taxYear.toString()).up();
        header.ele('Filer')
            .ele('PrimarySSN').txt('000-00-0000').up() // Placeholder/Mock
            .ele('NameLine1').txt(`${user.first_name} ${user.last_name}`).up()
            .up();

        // 2. Return Data
        const data = root.ele('ReturnData');
        data.att('documentCount', '1');

        // 3. IRS 1040
        const f1040 = data.ele('IRS1040');
        f1040.att('documentId', 'DOC001');

        // Helper to get line value
        const getVal = (ln: string) => {
            const line = result.lines.find(l => l.form === '1040' && l.lineNumber === ln);
            return line ? Math.round(line.value) : 0; // XML usually wants integers for amounts
        };

        // Income
        f1040.ele('WagesSalariesAndTips').txt(getVal('1z').toString()).up();
        f1040.ele('TaxableInterest').txt(getVal('2b').toString()).up();
        f1040.ele('OrdinaryDividends').txt(getVal('3b').toString()).up();
        f1040.ele('CapitalGainLoss').txt(getVal('7').toString()).up();

        // Income Totals
        // Note: Total Income is not always explicit in 1040 schema vs calc, but Taxable Income is key
        f1040.ele('TaxableIncome').txt(getVal('15').toString()).up();

        // Tax
        f1040.ele('Tax').txt(getVal('16').toString()).up();
        f1040.ele('TotalTax').txt(getVal('24').toString()).up();
        f1040.ele('TotalPayments').txt(getVal('25d').toString()).up();

        // Refund / Owed
        if (result.refund > 0) {
            f1040.ele('RefundAmount').txt(Math.round(result.refund).toString()).up();
        } else {
            f1040.ele('AmountOwed').txt(Math.round(result.amountOwed).toString()).up();
        }

        return root.end({ prettyPrint: true });
    }
}
