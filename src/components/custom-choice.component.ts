import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import * as Choices from 'choices.js';

export abstract class ChoiceTemplate implements OnInit {
  contextExp: { $implicit: any };

  @Input() classNames: Choices.ClassNames;
  @Input() data: Choices.Choice;
  @Input() tpl: TemplateRef<any>;
  @Input() withCheckbox: boolean = false;
  @Input() config: Choices.Options;
  @Input() isMultiple: boolean = false;

  abstract get getClass();

  ngOnInit() {
    this.contextExp = {
      $implicit: this.data
    }
  }
}

@Component({
  template: `
    <div class="{{classNames.item}} {{classNames.itemChoice}}"
         [ngClass]="getClass"
         data-choice
         [attr.data-value]="data.value"
         [attr.data-id]="data.id"
         [attr.data-choice-selectable]="!data.disabled"
         [attr.data-choice-disabled]="data.disabled"
         [attr.aria-disabled]="data.disabled"
         [attr.role]="data.groupId > 0 ? 'treeitem' : 'option'">
      <ng-container *ngTemplateOutlet="tpl;context: contextExp"></ng-container>
      <span *ngIf="isMultiple && withCheckbox" [class.choices__checkbox--selected]="data.selected"
            class="choices__checkbox"></span>
      <ng-container *ngIf="!tpl">{{data.label}}</ng-container>
    </div>
  `
})
export class CustomChoiceComponent extends ChoiceTemplate implements OnInit {
  get getClass() {
    return {
      [this.classNames.itemDisabled]: this.data.disabled,
      [this.classNames.itemSelectable]: !this.data.disabled,
      'choices__item--selected': this.data.selected,
      'choices__placeholder': this.data.isPlaceholder
    }
  }
}

@Component({
  template: `
    <div class="{{classNames.item}}"
         [ngClass]="getClass"
         data-item
         [attr.data-value]="data.value"
         [attr.data-id]="data.id"
         [attr.aria-selected]="data.active"
         [attr.aria-disabled]="data.disabled">
      <ng-container *ngTemplateOutlet="tpl;context: contextExp"></ng-container>
      <ng-container *ngIf="!tpl">{{data.label}}</ng-container>
      <button type="button" class="choices__button" data-button *ngIf="isMultiple && config.removeItemButton">
        Remove item
      </button>
    </div>
  `
})
export class CustomChoiceSelectedComponent extends ChoiceTemplate implements OnInit {
  get getClass() {
    return {
      [this.classNames.highlightedState]: this.data.highlighted,
      [this.classNames.itemSelectable]: !this.data.highlighted,
      'choices__placeholder': this.data.isPlaceholder
    }
  }

}
