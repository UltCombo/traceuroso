async function foo() {}
class C {}
let [a, b] = ((a = 0o52, ...b) => [a, b])(...[
	for (i of [1, 2, 3]) i
]);
const o = {
	[Symbol()]: `a`,
	b,
	* g() {}
};

export {o as exports};
