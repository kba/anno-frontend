// Sort criterion: Custom order for diglit.

module.exports = `

references      isReferencedBy
conformsTo
replaces        isReplacedBy
requires        isRequiredBy

`.match(/\S+/g);
