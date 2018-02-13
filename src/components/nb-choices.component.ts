import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as Choices from 'choices.js';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {CustomChoiceComponent, CustomChoiceSelectedComponent} from "./custom-choice.component";
import {CHOICES_CONFIG, CHOICES_TEXT_CONFIG} from "./nb-choices.config";
import {choicesDefaults, textDefaults} from "../nb-choices-defaults";

/** Control value accessor to bridge choices with Angular forms */
export const CHOICES_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ChoicesComponent),
  multi: true,
};

@Component({
  selector: 'choices',
  providers: [CHOICES_VALUE_ACCESSOR],
  exportAs: 'choices',
  template: `
    <select #selectElement (change)="onChange($event)"
            (search)="search($event)"
            (choice)="choice($event)"
            (showDropdown)="showDropdown()"
            [ngStyle]="text && {display: 'none'}"></select>

    <input #textElement [ngStyle]="!text && {display: 'none'}"
           (search)="search($event)"
           (change)="onChange($event)">
  `
})
export class ChoicesComponent implements OnInit, OnDestroy, ControlValueAccessor {

  /** The native instance of choices.js */
  choicesInstance: Choices;

  /** The native select element */
  @ViewChild('selectElement') select: ElementRef;

  /** The native input element */
  @ViewChild('textElement') textElement: ElementRef;

  /** Whether is a text type */
  @Input() text = false;

  /** Whether the select should be multiple */
  @Input() isMultiple = false;

  /** The value to show when the control is empty */
  @Input() placeholder = 'Choose..';

  /** Whether to show the search box */
  @Input() isCombo = true;

  /** The value to show on the search input */
  @Input() searchPlaceholder = 'Search..';

  /** The label which bound to the option text */
  @Input() labelKey = 'label';

  /** The value which bound to the option value */
  @Input() valueKey = 'value';

  /** The list of choices */
  @Input() choices = [];

  /** The list of items (relevant for text) */
  @Input() items = [];

  /** TemplateRef that replace the default view  */
  @Input() choiceTemplate: TemplateRef<any>;

  /** The loading text */
  @Input() loadingText = 'Loading..';

  /** The text config */
  @Input() textConfig: Partial<Choices.Options> = {};

  /** Whether to show a checkbox in multiple dropdown */
  @Input() withCheckbox: boolean = false;

  /** Whether to show the loading text */
  @Input() set loading(loading: boolean) {
    this._handleLoading(loading);
    this._isLoading = loading;
  }

  /** Triggered when a user types into an input to search choices.  */
  @Output() onSearch = new EventEmitter<string>();

  /** The model that is bound to the form control */
  _model = null;

  private _isLoading = false;

  /** Factory for each choice item   */
  private _choiceFactory: ComponentFactory<CustomChoiceComponent>;

  /** Factory for the selected items - multiple dropdown  */
  private _itemFactory: ComponentFactory<CustomChoiceSelectedComponent>;

  /** Cache Angular elements  */
  private _elementsMap = new Map<string, HTMLElement>();

  /** Cache Choices DOM elements  */
  private _choicesMap = new Map<string, HTMLElement>();

  /** Choices config */
  private _config: Choices.Options;

  /** onChange triggers when the value changes from choices.js */
  _onChange: Function = (value: any) => {
  };

  /** _onTouched triggers when thøe value changes from choices.js */
  _onTouched: Function = (value: any) => {
  };

  constructor(private _renderer: Renderer2,
              private _injector: Injector,
              private _resolver: ComponentFactoryResolver,
              private _host: ElementRef,
              @Optional() @Inject(CHOICES_CONFIG) private _choicesConfig,
              @Optional() @Inject(CHOICES_TEXT_CONFIG) private _choicesTextConfig) {
  }

  /**
   * Get the native DOM select element
   * @returns {HTMLElement}
   */
  get selectElement() {
    return this.select.nativeElement as HTMLElement;
  }

  /**
   * Render the choices
   */
  ngOnInit() {
    this._choiceFactory = this._resolver.resolveComponentFactory(CustomChoiceComponent);
    this._itemFactory = this._resolver.resolveComponentFactory(CustomChoiceSelectedComponent);
    this._renderChoices(this.text ? this.items : this.choices);
  }

  /**
   * Update Angular form control when the value changes
   * If the value is empty, reset the model and show the placeholder
   * @param {string | string[]} choice
   */
  onChange(choice: string | string[]) {
    if (this._isEmpty(this.choicesValue)) {
      this._onChange(Array.isArray(choice) ? [] : null);
      return;
    }

    this._onChange(this.choicesValue);
  }

  /**
   * Allow remove the selected item from the dropdown
   * @param event
   */
  choice(event) {
    const choice = event.detail.choice;
    if (this.isMultiple && choice.selected && this._config.removeItems) {
      const withoutChoice = (this.choicesValue as string[]).filter(selected => selected !== choice.value);
      this.choicesInstance.removeActiveItems();
      this.setChoice(withoutChoice);
      this.onChange(withoutChoice);
    }
  }

  /**
   *
   * @returns {string[] | string}
   */
  get choicesValue(): string[] | string {
    return this.choicesInstance.getValue(true) as (string[] | string);
  }

  /**
   * Update the value of choices.js accroding to the form control value
   * @param {string | string[]} model
   */
  writeValue(model: string | string[]) {
    this.setChoice(model);
    this._model = model;
  }

  /**
   * Disable choices
   */
  disable() {
    this.choicesInstance.disable();
  }

  /**
   * Enable choices
   */
  enable() {
    this.choicesInstance.enable();
  }

  /**
   * Toggle single and multi
   * Currently there is a bug so need to wrap with timeout
   * https://github.com/jshjohnson/Choices/issues/237
   * @param {boolean} show
   */
  toggleDropdown(show: boolean) {
    setTimeout(() => {
      if (show) {
        this.choicesInstance.showDropdown(true);
      } else {
        this.choicesInstance.hideDropdown();
      }
    });
  }

  /**
   * Form control disable action
   * @param {boolean} isDisabled
   */
  setDisabledState(isDisabled: boolean) {
    const action = isDisabled ? 'disable' : 'enable';
    this[action]();
  }

  /**
   * Clear the value, this will trigger the onChange and clear the value
   */
  clear() {
    this.choicesInstance['_selectPlaceholderChoice']();
  }

  /**
   * Clear multiple select
   * There is inconsistent between single and multiple clear action
   * where single trigger the onChange event and multiple does not
   * so we need to reset the control value
   */
  clearMultiple() {
    this.choicesInstance.removeActiveItems();
    this.onChange([]);
  }

  /**
   * Update the active value
   * @param model
   */
  setChoice(model: string | string[]) {
    this.choicesInstance.setValueByChoice(model);
  }

  /**
   * If we have loading indicator show the loading element
   */
  showDropdown() {
    if (this._isLoading) {
      this._createLoader();
    }
  }

  /**
   * Refresh the select element when the choices/items value changes
   * @param changes
   */
  ngOnChanges(changes) {
    if (changes.choices && !changes.choices.firstChange) {
      const newChoices = changes.choices.currentValue;
      this._applyChanges(newChoices);
    }

    if (changes.items && !changes.items.firstChange) {
      const newItems = changes.items.currentValue;
      this._applyChanges(newItems);
    }
  }

  /**
   *
   * @param $event
   */
  search($event) {
    const value = $event.detail.value;
    this.onSearch.emit(value);
  }

  /**
   * Whether choices is open
   * @returns {boolean}
   */
  private get isOpen() {
    return (this.choicesInstance['containerOuter'] as HTMLElement).classList.contains('is-open');
  }

  /**
   * Get the clone input from choices so we can add the placeholder
   * @returns {Element | null}
   */
  private get choicesInputElement() {
    const selector = '.choices__input--cloned';
    return (this._host.nativeElement as HTMLElement).querySelector(selector);
  }

  /**
   *
   * @returns {HTMLElement}
   */
  private get dropdownElement() {
    return this._host.nativeElement.querySelector('.choices__list--dropdown .choices__list') as HTMLElement;
  }

  /**
   *
   * @returns {HTMLElement}
   */
  private get loaderDivElement() {
    return this._host.nativeElement.querySelector('.choices__loading') as HTMLElement;
  }

  /**
   *
   * @param {boolean} loading
   * @private
   */
  private _handleLoading(loading: boolean) {
    if (!loading && this.isOpen) {
      this.dropdownElement.removeChild(this.loaderDivElement);
      setTimeout(() => this.choicesInstance.showDropdown(true));
    }
  }

  /**
   * Create loader element
   * @private
   */
  private _createLoader() {
    const div = this._renderer.createElement('div');
    this._renderer.setProperty(div, 'innerHTML', this.loadingText);
    this._renderer.addClass(div, 'choices__loading');
    this._renderer.addClass(div, 'choices__item');
    this._renderer.appendChild(this.dropdownElement, div);
  }

  /**
   *
   * @param newValue
   * @private
   */
  private _applyChanges(newValue) {
    // Currently We need to destroy to persist the placeholder
    this.choicesInstance.destroy();
    this._renderChoices(newValue);
    this.setChoice(this._model);
  }

  /**
   * If the value is undefined or is a placeholder
   * @param choicesValue
   * @returns {boolean}
   * @private
   */
  private _isEmpty(choicesValue) {
    return !choicesValue || choicesValue.placeholder || choicesValue === this.placeholder;
  }

  /**
   * Add the multiple attribute to the native select element
   * @param {boolean} isMultiple
   * @private
   */
  private _markAsMultiple(isMultiple: boolean) {
    if (isMultiple) {
      this._renderer.setAttribute(this.selectElement, 'multiple', 'true');
    }
  }

  /**
   * Add placeholder to a single select
   * @param {boolean} isSingle
   * @param {string} placeholder
   * @private
   */
  private _addPlaceholder() {
    if (!this.isMultiple) {
      const option = this._renderer.createElement('option');
      this._renderer.setAttribute(option, 'placeholder', 'true');
      this._renderer.setProperty(option, 'innerText', this.placeholder);
      this._renderer.appendChild(this.selectElement, option);
    }
  }

  /**
   *
   * @param items
   * @private
   */
  private _renderChoices(items) {
    if (this.text) {
      const config = this._getTextConfig(items);
      this.choicesInstance = new Choices(this.textElement.nativeElement, config);
      this._updateInitialTextValues();
      this.setPlaceholderForText();
    } else {
      this._markAsMultiple(this.isMultiple);
      this._addPlaceholder();
      this._config = this._getConfig();
      this.choicesInstance = new Choices(this.selectElement, this._config);
      this.choicesInstance.setChoices(items, this.valueKey, this.labelKey, false);
    }
  }

  /**
   * We need to call setTimeout because the writeValue is
   * called after this and override this
   * @private
   */
  private _updateInitialTextValues() {
    setTimeout(() => {
      this.onChange(this.choicesValue);
    });
  }

  /**
   * Set the placeholder for text
   */
  private setPlaceholderForText() {
    this._renderer.setProperty(this.choicesInputElement, 'placeholder', this.placeholder);
  }

  /**
   * Merge the default config with the provide one
   * @private
   */
  private _getConfig() {
    return {...this._getDefaultConfig(), ...(this._choicesConfig || {})};
  }

  /**
   *  Merge the default text config with the provide one
   * @param items
   * @private
   */
  private _getTextConfig(items) {
    return {
      ...textDefaults(this),
      ...this.textConfig,
      ...this._choicesTextConfig,
      items
    }
  }

  /**
   *
   * @private
   */
  private _getDefaultConfig() {
    const that = this;
    return {
      ...choicesDefaults(this),
      callbackOnCreateTemplates(template) {
        return that._createTemplateFromComponents(template, this.config.classNames, this.isSelectMultipleElement);
      },
    }
  }

  /**
   *
   * @param {Function} template
   * @param {ChoicesClassNames} classNames
   * @param {boolean} isSelectMultipleElement
   * @returns {{item: (data) => any; choice: (data) => any}}
   * @private
   */
  private _createTemplateFromComponents(template: Function, classNames: Choices.ClassNames, isSelectMultipleElement: boolean) {
    return {
      item: (data: Choices.Choice) => {
        return template(this._createComponent(classNames, data, isSelectMultipleElement, 'item'));
      },
      choice: (data: Choices.Choice) => {
        const seralizeData = JSON.stringify(data);
        /** Performance optimization, if the data/selected does not changed return the HTML element from cache **/
        if (this._choicesMap.has(seralizeData) && !data.selected) {
          return this._choicesMap.get(seralizeData)
        }
        const HTML = template(this._createComponent(classNames, data, isSelectMultipleElement));
        this._choicesMap.set(seralizeData, HTML)

        return HTML;
      },
    };
  }

  /**
   *
   * @param classNames
   * @param data
   * @param {boolean} isMultiple
   * @param {string} type
   * @private
   */
  private _createComponent(classNames, data, isMulti = false, type = 'choice') {
    const that = this;
    const seralizeData = JSON.stringify(data);

    /** Performance optimization, if the data does not changed return the HTML element from cache **/
    if (this._elementsMap.has(seralizeData)) {
      return this._elementsMap.get(seralizeData)
    }

    const componentFactory = type === 'choice' ? '_choiceFactory' : '_itemFactory';
    const component = that[componentFactory].create(that._injector);
    data.isPlaceholder = data.placeholder || (data.value === this.placeholder);
    component.instance.classNames = classNames;
    component.instance.data = data;
    component.instance.tpl = that.choiceTemplate;
    component.instance.withCheckbox = that.withCheckbox;
    component.instance.config = this._config;
    (component.instance as CustomChoiceSelectedComponent).isMultiple = isMulti;
    component.changeDetectorRef.detectChanges();
    const HTML = component.location.nativeElement.innerHTML;
    this._elementsMap.set(seralizeData, HTML);
    return HTML;
  }

  /**
   *
   * @param {Function} fn
   */
  registerOnChange(fn: Function): void {
    this._onChange = fn;
  }

  /**
   *
   * @param {Function} fn
   */
  registerOnTouched(fn: Function): void {
    this._onTouched = fn;
  }

  /**
   * Cleaning
   */
  ngOnDestroy() {
    this._elementsMap.clear();
    this._choicesMap.clear();
    this.choicesInstance.destroy();
  }

}
