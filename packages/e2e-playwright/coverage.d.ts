import { Coverage } from 'istanbul-lib-coverage';

declare global {
    interface Window {
        __coverage__?: Coverage;
        collectIstanbulCoverage?: (coverageJSON: string) => void;
    }
}
