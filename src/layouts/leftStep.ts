import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Charles Janet Left-Step Periodic Table.
 * Based on electron orbital filling (Madelung rule).
 * s-block shifted to far right, He placed with alkaline earths.
 * Rows correspond to n+l values.
 */

// Janet table: rows are based on n+l quantum number pairs
// The table has 8 rows (n+l from 1 to 8) and up to 32 columns

interface JanetPos { col: number; row: number; }

function getJanetPosition(el: ElementData): JanetPos {
    const z = el.atomicNumber;
    let row = 0, col = 0;

    // s-block (cols 31-32)
    if (el.group === 1 || el.group === 2 || z === 2) {
        if (z === 1) { row = 1; col = 31; }
        else if (z === 2) { row = 1; col = 32; }
        else if (z === 3 || z === 4) { row = 2; col = 31 + (z - 3); }
        else if (z === 11 || z === 12) { row = 3; col = 31 + (z - 11); }
        else if (z === 19 || z === 20) { row = 4; col = 31 + (z - 19); }
        else if (z === 37 || z === 38) { row = 5; col = 31 + (z - 37); }
        else if (z === 55 || z === 56) { row = 6; col = 31 + (z - 55); }
        else if (z === 87 || z === 88) { row = 7; col = 31 + (z - 87); }
        else if (z >= 119) { row = 8; col = 31 + (z % 2 === 1 ? 0 : 1); }
    }
    // p-block (cols 25-30)
    else if (el.group >= 13 && el.group <= 18) {
        let p_idx = el.group - 13; // 0 to 5
        if (z >= 5 && z <= 10) { row = 3; col = 25 + p_idx; }
        else if (z >= 13 && z <= 18) { row = 4; col = 25 + p_idx; }
        else if (z >= 31 && z <= 36) { row = 5; col = 25 + p_idx; }
        else if (z >= 49 && z <= 54) { row = 6; col = 25 + p_idx; }
        else if (z >= 81 && z <= 86) { row = 7; col = 25 + p_idx; }
        else if (z >= 113 && z <= 118) { row = 8; col = 25 + p_idx; }
    }
    // d and f blocks
    else {
        if (z >= 21 && z <= 30) { row = 5; col = 15 + (z - 21); }
        else if (z >= 39 && z <= 48) { row = 6; col = 15 + (z - 39); }
        else if (z >= 57 && z <= 70) {
            // f-block (cols 1-14)
            row = 7; col = 1 + (z - 57);
        }
        else if (z >= 71 && z <= 80) {
            // d-block (cols 15-24)
            row = 7; col = 15 + (z - 71);
        }
        else if (z >= 89 && z <= 102) {
            // f-block
            row = 8; col = 1 + (z - 89);
        }
        else if (z >= 103 && z <= 112) {
            // d-block
            row = 8; col = 15 + (z - 103);
        }
    }
    return { col, row };
}

export const leftStepLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
    const positions = new Map<number, LayoutPosition>();
    const labels: LayoutResult['labels'] = [];

    elements.forEach((el) => {
        const pos = getJanetPosition(el);
        positions.set(el.atomicNumber, { x: pos.col + 1, y: pos.row + 1 }); // +1 for labels
    });

    // Block labels
    const blockLabels = [
        { text: 'f-block', x: 8, y: 1, type: 'block' as const },
        { text: 'd-block', x: 20, y: 1, type: 'block' as const },
        { text: 'p-block', x: 28, y: 1, type: 'block' as const },
        { text: 's-block', x: 32, y: 1, type: 'block' as const },
    ];
    labels.push(...blockLabels);

    // Row labels
    for (let r = 1; r <= 8; r++) {
        labels.push({ text: String(r), x: 1, y: r + 1, type: 'period' });
    }

    return {
        positions,
        gridCols: 34, // 1 label + 32 cols + buffer
        gridRows: 10, // 1 label + 8 rows + buffer
        labels,
    };
};
