const { NonDeterministicFiniteAutomaton, FiniteAutomataTest } = require('fauton');
const path = require('path');

const startsWithAB = new NonDeterministicFiniteAutomaton(
	(inputString) => inputString.startsWith('ab'),
	{
		alphabets: ['a', 'b', 'c'],
		description: 'Starts with ab',
		final_states: ['C'],
		label: 'starts_with_ab',
		start_state: 'A',
		states: ['A', 'B', 'C'],
		transitions: {
			A: ['B'],
			B: [null, 'C'],
			C: 'loop',
		},
	}
);

const finiteAutomataTest = new FiniteAutomataTest(path.join(__dirname, 'logs'));
finiteAutomataTest.test([
	{
		automaton: startsWithAB,
		options: {
			type: 'generate',
			range: {
				maxLength: 10,
			},
		},
	},
]);
