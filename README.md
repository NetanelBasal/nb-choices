## 📢 Angular Choices 
**Angular wrapper for choices.js** - vanilla, lightweight, configurable select box/text input plugin. Similar to Select2 and Selectize but without the jQuery dependency.

Live Demo - https://stackblitz.com/edit/nb-choices

## 🍭 Features

 - Angular forms support
 - Custom Angular templates
 - Placeholder support out of the box
 - Works with observables and the async pipe
 - Custom checkbox in multiple dropdowns
 - Escaping your HTML out of the box
 - Modern styling
 
![Demo](https://s18.postimg.org/6z2aazzwp/choices-demo.gif)

## Installation
```
npm install nb-choices
yarn add nb-choices
```

## Style
`@import '~nb-choices/nb-choices.scss'` 


 ## Examples

#### Single Select
```html
<choices [formControl]="control"
         [choices]="options"
         placeholder="Choose..."></choices>

```


#### Single Select - Combo box
```html
 <choices [formControl]="control"
          [isCombo]="true"
          [choices]="options"
          placeholder="Choose..."></choices>
```

              
#### Single Select - Group
```ts
this.options = [{
  label: 'Group one',
  id: 1,
  choices: [
    { value: 'Child One', label: 'Child One' },
    { value: 'Child Two', label: 'Child Two' },
  ]
 },
 {
   label: 'Group two',
   id: 2,
   choices: [
     { value: 'Child Four', label: 'Child Three' },
     { value: 'Child Five', label: 'Child Four' },
   ]
}];
```
```html
<choices [formControl]="control"
         [choices]="options"
         placeholder="Choose..."></choices>
```


#### With Custom Template
```ts
this.options = [{
      value: 'chrome',
      label: 'Chrome',
      customProperties: {
        icon: 'chrome'
      }
    },
    {
      value: 'explorer',
      label: 'Explorer',
      customProperties: {
        icon: 'internet-explorer'
    }
 }];

```
```html
<ng-template #tpl let-data>
 <i class="fa fa-{{data.customProperties?.icon}}"></i> {{data.label}}
</ng-template>

<choices [formControl]="control"
         [isCombo]="true"
         [choiceTemplate]="tpl"
         [choices]="options"
         placeholder="Choose..."></choices>
```

             
#### With Observables
```ts
ngOnInit() {
  this.loading = true;
  this.options$ = timer(500).mapTo(this.options).do(() => {
    this.loading = false
  });
}
```
```html
<choices [formControl]="control"
         [isCombo]="true"
         [loading]="loading"
         [choices]="options$ | async"
         placeholder="Choose..."></choices>
```
      
   

#### Multiple Select
```html
<choices [isMultiple]="true"
         [choices]="options"
         [isCombo]="true"
         [formControl]="control"
         placeholder="Choose skills..."></choices>
```
#### Multiple Select - With Checkbox
```html
<choices [isMultiple]="true"
         [choices]="options"
         [withCheckbox]="true"
         [isCombo]="true"
         [formControl]="control"
         placeholder="Choose skills..."></choices>
```
#### Controls
```html
<choices [formControl]="control"
         [isCombo]="true"
         #choices="choices"
         [choices]="options"
         placeholder="Choose..."></choices>

<button (click)="choices.toggleDropdown(true)">Show</button>
<button (click)="choices.toggleDropdown()">Hide</button>
<button (click)="choices.disable()">Disable</button>
<button (click)="choices.enable()">Enable</button>
<button (click)="choices.clear()">Reset</button>
<button (click)="choicesMultiple.clearMultiple()">Reset multiple select</button>
```
#### Text

```html
<choices [text]="true" [items]="textOptions" [formControl]="controText" #choicesText="choices"></choices>

<button (click)="choicesText.clearMultiple()">Reset</button>
```

#### Configuration
The default configurations of `nb-choices` for selects are:
```ts
{
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
}
```
The default configurations of `nb-choices` for texts are:

```ts
{
  duplicateItems: false,
  removeItemButton: true,
}
```

You can extend the configurations by providing the `CHOICES_CONFIG` provider for **selects** or the `CHOICES_TEXT_CONFIG` for **texts**. 

For example:
```ts
providers: [{provide: CHOICES_CONFIG, useValue: { removeItems: false }}]
```
     

#### Options
| @Inputs()         | Description                                     | Default     |
|-------------------|-------------------------------------------------|-------------|
| isMultiple        | Whether the select should be multiple           | `false`     |
| placeholder       | The value to show when the control is empty     | `Choose..`  |
| isCombo           | Whether to show the search box                  | `true`      |
| text              | Whether is a text type                          | `false`     |
| searchPlaceholder | The value to show on the search input           | `Search..`  |
| labelKey          | The label which bound to the option text        | `label`     |
| valueKey          | The value which bound to the option value       | `value`     |
| choices           | The list of choices                             | `[]`        |
| items             | The list of items (relevant for text)           | `[]`        |
| choiceTemplate    | TemplateRef that will replace the default view  | `null`      |
| loadingText       | The loading text                                | `Loading..` |
| textConfig        | The text config                                 | `{}`        |
| withCheckbox      | Whether to show a checkbox in multiple dropdown | `false`     |
| loading           | Whether to show the loading text                | `false`     |


| @Outputs() | Description                                                 |
|------------|-------------------------------------------------------------|
| onSearch   | Triggered when a user types into an input to search choices |


#### Custom Styling
You can customize the style by modifying the `nb-choices.scss` and include it in your application. 

#### TODO
- Add Tests
