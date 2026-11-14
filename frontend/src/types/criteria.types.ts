// Level 4: The specific activities
export interface CriteriaActivity {
    UCAId: number;
    AId: number;
    AName: string;
    StartTime: string;
    FinishTime: string;
    UCAStatus: number;
}

// Level 3: The criteria rules
export interface Criterium {
    CId: number;
    CName: string;
    UCPoint: number;
    CMaxPoint: number;
    UserCriteriaActivityLst: CriteriaActivity[]; // <-- Array of Level 4
}

// Level 2: The groups
export interface CriteriaGroup {
    CGId: number;
    CGName: string;
    CGPoint: number;
    CGMaxPoint: number;
    UserCriteriaDetailsLst: Criterium[]; // <-- Array of Level 3
}

// Level 1: The main category (This is what your 'data' array is full of)
export interface Category {
    CTId: number;
    CTName: string;
    CTPoint: number;
    CTMaxPoint: number;
    CriteriaGroupDetailsLst: CriteriaGroup[]; // <-- Array of Level 2
}