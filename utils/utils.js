// Function to check if an array has duplicate elements
function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

module.exports = {
    hasDuplicates,
};