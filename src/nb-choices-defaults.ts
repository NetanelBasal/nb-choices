export const choicesDefaults = ( context ) => ({
  placeholderValue: context.placeholder,
  searchEnabled: context.isCombo,
  searchPlaceholderValue: context.searchPlaceholder,
  silent: true,
  removeItems: true,
  removeItemButton: true,
  duplicateItems: false,
  resetScrollPosition: false,
  searchResultLimit: 10000,
  fuseOptions: {
    threshold: 0.2,
  },
  shouldSort: false,
  shouldSortItems: false,
  renderSelectedChoices: 'always',
  loadingText: 'Loading...',
  noResultsText: 'No results found',
  noChoicesText: 'No choices to choose from',
  itemSelectText: '',
});

export const textDefaults = ( context ) => ({
  duplicateItems: false,
  removeItemButton: true,
})
