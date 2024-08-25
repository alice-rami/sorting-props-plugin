export function getSourceCode(context) {
	return context.getSourceCode ? context.getSourceCode() : context.sourceCode;
}

// export function getText(context) {
// 	const sourceCode = getSourceCode(context);
// 	const args = Array.prototype.slice.call(arguments, 1);
// 	return sourceCode.getText
// 		? sourceCode.getText.apply(sourceCode, args)
// 		: context.getSource.apply(context, args);
// }
