import { TaxInput, TaxLine } from '../../types';
import { TaxMath } from '../../math';

export class FormScheduleD_2025 {
    static calculate(input: TaxInput): TaxLine[] {
        const lines: TaxLine[] = [];
        const txs = input.capitalGainsTransactions || [];

        // Short-Term
        const shortTermTxs = txs.filter(t => !t.isLongTerm);
        const stProceeds = shortTermTxs.reduce((sum, t) => TaxMath.add(sum, t.proceeds), 0);
        const stBasis = shortTermTxs.reduce((sum, t) => TaxMath.add(sum, t.costBasis), 0);
        const netShortTerm = TaxMath.sub(stProceeds, stBasis);

        // Long-Term
        const longTermTxs = txs.filter(t => t.isLongTerm);
        const ltProceeds = longTermTxs.reduce((sum, t) => TaxMath.add(sum, t.proceeds), 0);
        const ltBasis = longTermTxs.reduce((sum, t) => TaxMath.add(sum, t.costBasis), 0);
        const netLongTerm = TaxMath.sub(ltProceeds, ltBasis);

        // Net Capital Gain/Loss
        const netGainLoss = TaxMath.add(netShortTerm, netLongTerm);
        console.log('--- Schedule D Debug ---');
        console.log('Net Gain/Loss:', netGainLoss, typeof (netGainLoss));

        // Application of Limitation (If loss, max deduction is $3,000)
        // Note: Logic is complex for MFS ($1,500), using default $3,000 for MVP
        let allowableLoss = netGainLoss;
        if (netGainLoss < 0) {
            allowableLoss = Math.max(netGainLoss, -3000);
            console.log('Limitation Applied:', allowableLoss);
        } else {
            console.log('No Limitation Applied (Gain or 0)');
        }

        lines.push({
            id: 'SchD_NetST',
            description: 'Net Short-Term Capital Gain/Loss',
            value: netShortTerm,
            form: 'Schedule D',
            lineNumber: '7'
        });

        lines.push({
            id: 'SchD_NetLT',
            description: 'Net Long-Term Capital Gain/Loss',
            value: netLongTerm,
            form: 'Schedule D',
            lineNumber: '15'
        });

        lines.push({
            id: 'SchD_Allowable',
            description: 'Allowable Capital Gain/Loss',
            value: allowableLoss,
            form: 'Schedule D',
            lineNumber: '16' // Actually flows to 1040 Line 7
        });

        return lines;
    }
}
