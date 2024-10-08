import { getSourceCode } from './utils.js';
import pkg from 'jsx-ast-utils';
const { propName } = pkg;

let attributeMap;
let prefixes;
let propsOrder;
let isShorthandSorted;
let isAriaSorted;
let isDataSorted;

const propGroupsMap = {
	other: [],
};

const isAria = (propName) => /^aria-[a-z]/.test(propName);
const isData = (propName) => /^data-[a-z]/.test(propName);
const isShorthand = (prop) => prop.value === null;

const addToPropsGroup = (prop, name) => {
	let isOther = true;

	for (const prefix of prefixes) {
		const re = new RegExp(`^${prefix}[A-Z]`);
		const reFull = new RegExp(`^${prefix}$`);

		if (re.test(name) || reFull.test(name)) {
			propGroupsMap[prefix].push(prop);
			isOther = false;
			break;
		}
	}
	if (isOther) {
		propGroupsMap.other.push(prop);
	}
};

const sortProp = (prop) => {
	const currPropName = propName(prop);

	if (isShorthandSorted && isShorthand(prop)) {
		propGroupsMap.shorthand.push(prop);
		return;
	}

	if (isAriaSorted && isAria(currPropName)) {
		propGroupsMap['aria-'].push(prop);
		return;
	}

	if (isDataSorted && isData(currPropName)) {
		propGroupsMap['data-'].push(prop);
		return;
	}

	addToPropsGroup(prop, currPropName);
};

const compareProps = (a, b) => {
	const nameA = propName(a);
	const nameB = propName(b);
	if (nameA < nameB) {
		return -1;
	}
	if (nameB > nameA) {
		return 1;
	}
	return 0;
};

const sortPropGroup = (group) => {
	for (const key in propGroupsMap) {
		propGroupsMap[key] = [];
	}
	group.forEach(sortProp);
	const sortedByPrefix = propsOrder.map((prefix) =>
		propGroupsMap[prefix].sort(compareProps)
	);

	return sortedByPrefix.flat();
};

function getGroupsOfSortableAttributes(attributes, context) {
	const sourceCode = getSourceCode(context);

	const sortableAttributeGroups = [];
	let groupCount = 0;
	function addtoSortableAttributeGroups(attribute) {
		sortableAttributeGroups[groupCount - 1].push(attribute);
	}

	for (let i = 0; i < attributes.length; i++) {
		const attribute = attributes[i];
		const nextAttribute = attributes[i + 1];
		const attributeline = attribute.loc.start.line;
		let comment = [];
		try {
			comment = sourceCode.getCommentsAfter(attribute);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			/**/
		}
		const lastAttr = attributes[i - 1];
		const attrIsSpread = attribute.type === 'JSXSpreadAttribute';

		// If we have no groups or if the last attribute was JSXSpreadAttribute
		// then we start a new group. Append attributes to the group until we
		// come across another JSXSpreadAttribute or exhaust the array.
		if (
			!lastAttr ||
			(lastAttr.type === 'JSXSpreadAttribute' && !attrIsSpread)
		) {
			groupCount += 1;
			sortableAttributeGroups[groupCount - 1] = [];
		}
		if (!attrIsSpread) {
			if (comment.length === 0) {
				attributeMap.set(attribute, {
					end: attribute.range[1],
					hasComment: false,
				});
				addtoSortableAttributeGroups(attribute);
			} else {
				const firstComment = comment[0];
				const commentline = firstComment.loc.start.line;
				if (comment.length === 1) {
					if (attributeline + 1 === commentline && nextAttribute) {
						attributeMap.set(attribute, {
							end: nextAttribute.range[1],
							hasComment: true,
						});
						addtoSortableAttributeGroups(attribute);
						i += 1;
					} else if (attributeline === commentline) {
						if (firstComment.type === 'Block' && nextAttribute) {
							attributeMap.set(attribute, {
								end: nextAttribute.range[1],
								hasComment: true,
							});
							i += 1;
						} else if (firstComment.type === 'Block') {
							attributeMap.set(attribute, {
								end: firstComment.range[1],
								hasComment: true,
							});
						} else {
							attributeMap.set(attribute, {
								end: firstComment.range[1],
								hasComment: false,
							});
						}
						addtoSortableAttributeGroups(attribute);
					}
				} else if (
					comment.length > 1 &&
					attributeline + 1 === comment[1].loc.start.line &&
					nextAttribute
				) {
					const commentNextAttribute =
						sourceCode.getCommentsAfter(nextAttribute);
					attributeMap.set(attribute, {
						end: nextAttribute.range[1],
						hasComment: true,
					});
					if (
						commentNextAttribute.length === 1 &&
						nextAttribute.loc.start.line ===
							commentNextAttribute[0].loc.start.line
					) {
						attributeMap.set(attribute, {
							end: commentNextAttribute[0].range[1],
							hasComment: true,
						});
					}
					addtoSortableAttributeGroups(attribute);
					i += 1;
				}
			}
		}
	}
	return sortableAttributeGroups;
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Sort component props',
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					order: {
						type: 'array',
					},
				},
			},
		],
	},

	create(context) {
		const configuration = context.options[0] || {};

		propsOrder = configuration.order || [];
		if (!propsOrder.includes('other')) {
			propsOrder.push('other');
		}

		prefixes = propsOrder.filter(
			(prefix) =>
				prefix !== 'aria-' &&
				prefix !== 'data-' &&
				prefix !== 'other' &&
				prefix !== 'shorthand'
		);
		for (const prefix of propsOrder) {
			propGroupsMap[prefix] = [];
		}

		isShorthandSorted = Object.hasOwn(propGroupsMap, 'shorthand');
		isAriaSorted = Object.hasOwn(propGroupsMap, 'aria-');
		isDataSorted = Object.hasOwn(propGroupsMap, 'data-');

		return {
			Program() {
				attributeMap = new WeakMap();
			},

			JSXOpeningElement(node) {
				const attributes = node.attributes;
				const sortableAttributeGroups = getGroupsOfSortableAttributes(
					attributes,
					context
				);

				const sortedAttributeGroups = sortableAttributeGroups
					.slice(0)
					.map(sortPropGroup);

				for (let i = 0; i < sortableAttributeGroups.length; i++) {
					const currSortable = sortableAttributeGroups[i];
					const currSorted = sortedAttributeGroups[i];
					for (let j = 0; j < currSortable.length; j++) {
						if (propName(currSortable[j]) !== propName(currSorted[j])) {
							context.report({
								node: currSortable[j].name,
								message: 'wrong props order',
								fix(fixer) {
									const fixers = [];
									let source = getSourceCode(context).getText();

									sortableAttributeGroups.forEach((sortableGroup, ii) => {
										sortableGroup.forEach((attr, jj) => {
											const sortedAttr = sortedAttributeGroups[ii][jj];
											const sortedAttrText = source.slice(
												sortedAttr.range[0],
												attributeMap.get(sortedAttr).end
											);
											fixers.push({
												range: [attr.range[0], attributeMap.get(attr).end],
												text: sortedAttrText,
											});
										});
									});

									fixers.sort((a, b) => b.range[0] - a.range[0]);

									const firstFixer = fixers[0];
									const lastFixer = fixers[fixers.length - 1];
									const rangeStart = lastFixer ? lastFixer.range[0] : 0;
									const rangeEnd = firstFixer ? firstFixer.range[1] : -0;

									fixers.forEach((fix) => {
										source = `${source.slice(0, fix.range[0])}${
											fix.text
										}${source.slice(fix.range[1])}`;
									});

									return fixer.replaceTextRange(
										[rangeStart, rangeEnd],
										source.slice(rangeStart, rangeEnd)
									);
								},
							});
						}
					}
				}
			},
		};
	},
};
