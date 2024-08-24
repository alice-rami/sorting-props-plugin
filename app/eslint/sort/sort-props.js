import { getSourceCode, getText } from './utils.js';
import pkg from 'jsx-ast-utils';
const { propName } = pkg;

let attributeMap;

const order = ['shortHand', 'key', 'size', 'on', 'handle', 'aria-', 'data-'];
const prefixes = order.filter(
	(prefix) => prefix !== 'aria-' && prefix !== 'data-'
);
const propGroupsMap = {
	other: [],
	shortHand: [],
	'data-': [],
	'aria-': [],
};

for (const prefix of prefixes) {
	propGroupsMap[prefix] = [];
}

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

	if (isShorthand(prop)) {
		propGroupsMap.shortHand.push(prop);
		return;
	}

	if (isAria(currPropName)) {
		propGroupsMap['aria-'].push(prop);
		return;
	}

	if (isData(currPropName)) {
		propGroupsMap['data-'].push(prop);
		return;
	}

	addToPropsGroup(prop, currPropName);
};

const sortPropGroup = (group) => {
	for (const key in propGroupsMap) {
		propGroupsMap[key] = [];
	}
	group.forEach(sortProp);
	const sortedByPrefix = order.map((prefix) =>
		propGroupsMap[prefix].sort((a, b) => propName(a) - propName(b))
	);
	const sortedOther = propGroupsMap.other.sort(
		(a, b) => propName(a) - propName(b)
	);
	return sortedByPrefix.flat().concat(sortedOther);
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
		// const configuration = context.options[0] || {};
		// const propsOrder = configuration.order || [];
		// TODO: Как передавать порядок пропсов?

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
									let source = getText(context);

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
