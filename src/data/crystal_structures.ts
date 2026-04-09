export type LatticeType = 'BCC' | 'FCC' | 'HCP' | 'Diamond Cubic' | 'Rhombohedral';

export interface CrystalStructureData {
    lattice: LatticeType;
    // Lattice constant in Angstroms
    a: number; 
    // Additional constants for non-cubic lattices
    c?: number;
}

// Maps element symbols to their primary crystal structure at STP
export const crystalStructures: Record<string, CrystalStructureData> = {
    // BCC - Body Centered Cubic
    'Fe': { lattice: 'BCC', a: 2.866 },
    'Cr': { lattice: 'BCC', a: 2.884 },
    'W': { lattice: 'BCC', a: 3.165 },
    'Na': { lattice: 'BCC', a: 4.291 },
    'K': { lattice: 'BCC', a: 5.328 },
    'V': { lattice: 'BCC', a: 3.024 },
    'Mo': { lattice: 'BCC', a: 3.147 },

    // FCC - Face Centered Cubic
    'Al': { lattice: 'FCC', a: 4.049 },
    'Cu': { lattice: 'FCC', a: 3.615 },
    'Ni': { lattice: 'FCC', a: 3.524 },
    'Ag': { lattice: 'FCC', a: 4.085 },
    'Au': { lattice: 'FCC', a: 4.078 },
    'Pt': { lattice: 'FCC', a: 3.924 },
    'Pb': { lattice: 'FCC', a: 4.950 },
    'Ca': { lattice: 'FCC', a: 5.588 },

    // HCP - Hexagonal Close Packed
    'Mg': { lattice: 'HCP', a: 3.209, c: 5.210 },
    'Ti': { lattice: 'HCP', a: 2.951, c: 4.684 },
    'Zn': { lattice: 'HCP', a: 2.665, c: 4.947 },
    'Co': { lattice: 'HCP', a: 2.507, c: 4.069 },
    'Sc': { lattice: 'HCP', a: 3.309, c: 5.268 },
    'Y': { lattice: 'HCP', a: 3.647, c: 5.731 },

    // Diamond Cubic
    'Si': { lattice: 'Diamond Cubic', a: 5.431 },
    'Ge': { lattice: 'Diamond Cubic', a: 5.658 },
    'Sn': { lattice: 'Diamond Cubic', a: 6.489 }, // gray tin

    // Rhombohedral
    'As': { lattice: 'Rhombohedral', a: 4.131 },
    'Sb': { lattice: 'Rhombohedral', a: 4.507 },
    'Bi': { lattice: 'Rhombohedral', a: 4.746 },
};
