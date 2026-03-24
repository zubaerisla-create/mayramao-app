export type ProfileStep =
    | 'income'
    | 'fixed_expenses'
    | 'loan_check'
    | 'loan_details'
    | 'variable_expenses'
    | 'savings'
    | 'dependents'
    | 'household_responsibility'
    | 'income_stability'
    | 'risk_tolerance';

export interface FinancialProfile {
    monthlyIncome: string;
    fixedExpenses: {
        rent: string;
        utilities: string;
        subscriptions: string;
    };
    hasLoans: boolean | null;
    loanDetails: {
        totalMonthlyPayment: string;
    };
    variableExpenses: string;
    currentSavings: string;
    dependents: number | null;
    householdResponsibility: 'all' | 'half' | 'small' | 'none' | null;
    incomeStability: 'very_stable' | 'mostly_stable' | 'sometimes' | 'unpredictable' | null;
    riskTolerance: 'safety' | 'balanced' | 'risky' | null;
}

export const INITIAL_PROFILE: FinancialProfile = {
    monthlyIncome: '',
    fixedExpenses: {
        rent: '',
        utilities: '',
        subscriptions: '',
    },
    hasLoans: null,
    loanDetails: {
        totalMonthlyPayment: '',
    },
    variableExpenses: '',
    currentSavings: '',
    dependents: null,
    householdResponsibility: null,
    incomeStability: null,
    riskTolerance: null,
};
