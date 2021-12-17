import { CFGOption } from '../../../types';

function createProductionCombinations(
	substitution: string,
	epsilonProducingVariable: string,
	epsilonProducingVariableCount: number
) {
	const totalCombinations = 2 ** epsilonProducingVariableCount;
	const newSubstitutions: string[] = [];
	let containsEpsilon = false;

	for (let index = 0; index < totalCombinations; index += 1) {
		let nthVariable = 0;
		let newSubstitution = '';
		for (
			let substitutionIndex = 0;
			substitutionIndex < substitution.length;
			substitutionIndex += 1
		) {
			const substitutionLetter = substitution[substitutionIndex];
			if (substitutionLetter === epsilonProducingVariable) {
				// If nthVariable is 4, it will generate the following combo, 10, 11, 01, 00
				// 11 means both the epsilon variable will be included, 00 means none will be included
				if (index & (1 << nthVariable)) {
					newSubstitution += substitutionLetter;
				}
				nthVariable += 1;
			} else {
				newSubstitution += substitutionLetter;
			}
		}
		// Set the contains epsilon flag to true if we have an epsilon string
		if (!newSubstitution.length) {
			containsEpsilon = true;
		} else {
			// Only add the substitution if we dont have any epsilon
			newSubstitutions.push(newSubstitution);
		}
	}
	return [newSubstitutions, containsEpsilon] as const;
}

/**
 * Removes all the null production and returns a new transition record
 * @param cfgOption Variables and transition record for cfg
 * @returns New transition record with null production removed
 */
export function removeNullProduction(
	cfgOption: Pick<CFGOption, 'variables' | 'productionRules' | 'startVariable'>
) {
	const { productionRules, variables, startVariable } = cfgOption;

	// eslint-disable-next-line
	while (true) {
		let epsilonProductionVariableIndex = -1;
		let epsilonProductionVariableSubstitutionIndex = -1;
		// TODO: Move to a separate module for unit testing purposes
		// Finding the variable which contains empty substitution
		for (let variableIndex = 0; variableIndex < variables.length; variableIndex += 1) {
			const variable = variables[variableIndex];
			// Making sure we are not checking the start variable, as the start variable can contain epsilon
			if (variable !== startVariable) {
				// Finding the index of the first epsilon substitution
				const nullSubstitutionIndex = productionRules[variable].findIndex(
					(substitution) => substitution.length === 0
				);
				if (nullSubstitutionIndex !== -1) {
					epsilonProductionVariableIndex = variableIndex;
					epsilonProductionVariableSubstitutionIndex = nullSubstitutionIndex;
					break;
				}
			}
		}

		if (epsilonProductionVariableIndex === -1) {
			break;
		} else {
			const epsilonProductionVariable = variables[epsilonProductionVariableIndex];
			// Remove the null substitution
			productionRules[epsilonProductionVariable].splice(
				epsilonProductionVariableSubstitutionIndex,
				1
			);
			// We need to loop through each item in production rules as we dont know how removing epsilon would impact the other substitutions
			Object.entries(productionRules).forEach(
				([productionRuleVariable, productionRuleSubstitutions]) => {
					const newSubstitutions: string[] = [];
					productionRuleSubstitutions.forEach((substitution) => {
						// Count the number of e production variable in the substitution
						const epsilonProductionVariableCount = substitution
							.split('')
							.filter((letter) => letter === epsilonProductionVariable).length;
						// If there are no variables that produces epsilon
						// No need to update the substitution
						if (epsilonProductionVariableCount === 0) {
							newSubstitutions.push(substitution);
						} else {
							const [productionCombinations, containsEpsilon] = createProductionCombinations(
								substitution,
								epsilonProductionVariable,
								epsilonProductionVariableCount
							);
							// Generate all possible combination of the production rule, with and without the epsilon producing variable
							newSubstitutions.push(...productionCombinations);
							// Only add epsilon if the variable is start variable and combination contains epsilon
							if (productionRuleVariable === startVariable && containsEpsilon) {
								newSubstitutions.push('');
							}
						}
					});

					// Making sure that there are no duplicates
					productionRules[productionRuleVariable] = Array.from(new Set(newSubstitutions));
				}
			);
		}
	}
	return productionRules;
}
