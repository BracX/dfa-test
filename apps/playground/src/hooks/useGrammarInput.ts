import { IContextFreeGrammar } from '@fauton/cfg';
import { useState } from 'react';
import { UserInputGrammar } from '../types';

export function useGrammarInput() {
	const [userInputGrammarRules, setUserInputGrammarRules] = useState<UserInputGrammar>([
		{
			variable: 'S',
			substitutions: [],
		},
	]);

	const productionRules: IContextFreeGrammar['productionRules'] = {};
	userInputGrammarRules.forEach((userInputGrammarRule) => {
		if (!productionRules[userInputGrammarRule.variable]) {
			productionRules[userInputGrammarRule.variable] = [];
		}
		userInputGrammarRule.substitutions.forEach((substitution) => {
			productionRules[userInputGrammarRule.variable]?.push(substitution.join(' '));
		});
	});

	return {
		productionRules,
		userInputGrammarRules,
		addRule: () => {
			userInputGrammarRules.push({
				variable: '',
				substitutions: [],
			});
			setUserInputGrammarRules([...userInputGrammarRules]);
		},
		addSubstitution(ruleIndex: number) {
			if (userInputGrammarRules[ruleIndex]) {
				userInputGrammarRules[ruleIndex]!.substitutions.push(['']);
				setUserInputGrammarRules([...userInputGrammarRules]);
			}
		},
		addToken(tokens: string[]) {
			tokens.push('');
			setUserInputGrammarRules([...userInputGrammarRules]);
		},
		updateToken(ruleIndex: number, substitutionIndex: number, tokenIndex: number, value: string) {
			const substitution = userInputGrammarRules[ruleIndex]?.substitutions[substitutionIndex];
			if (substitution && substitution.length > tokenIndex) {
				substitution![tokenIndex] = value;
				setUserInputGrammarRules([...userInputGrammarRules]);
			}
		},
		updateRuleVariable(ruleIndex: number, value: string) {
			const rule = userInputGrammarRules[ruleIndex];
			if (rule && value) {
				rule.variable = value;
				setUserInputGrammarRules([...userInputGrammarRules]);
			}
		},
		removeToken(ruleIndex: number, substitutionIndex: number, tokenIndex: number) {
			const substitutions = userInputGrammarRules[ruleIndex]?.substitutions;
			if (substitutions) {
				const tokens = substitutions[substitutionIndex];
				if (tokens) {
					tokens.splice(tokenIndex, 1);
					if (tokens.length === 0) {
						substitutions.splice(substitutionIndex, 1);
					}
					setUserInputGrammarRules([...userInputGrammarRules]);
				}
			}
		},
		removeSubstitution(ruleIndex: number, substitutionIndex: number) {
			const substitutions = userInputGrammarRules[ruleIndex]?.substitutions;
			if (substitutions) {
				substitutions.splice(substitutionIndex, 1);
				setUserInputGrammarRules([...userInputGrammarRules]);
			}
		},
		removeRule(ruleIndex: number) {
			userInputGrammarRules.splice(ruleIndex, 1);
			setUserInputGrammarRules([...userInputGrammarRules]);
		},
		resetState() {
			setUserInputGrammarRules([
				{
					variable: 'S',
					substitutions: [],
				},
			]);
		},
	};
}
