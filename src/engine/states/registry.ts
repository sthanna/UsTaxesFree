import { StateTaxStrategy } from './strategy';
import { FormIT201 } from './ny/it201';
import { FormPA40 } from './pa/pa40';
import { FormNJ1040 } from './nj/nj1040';

export class StateRegistry {
    static getStrategy(stateCode: string): StateTaxStrategy | undefined {
        switch (stateCode) {
            case 'NY': return new FormIT201();
            case 'PA': return new FormPA40();
            case 'NJ': return new FormNJ1040();
            default: return undefined;
        }
    }
}
