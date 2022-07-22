// :TODO: Document sort criterion

module.exports = `

references
isReferencedBy
conformsTo
replaces
isReplacedBy
requires
isRequiredBy

`.split(/\s+/).filter(Boolean);
