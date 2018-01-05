import * as Choices from "choices.js";
import { InjectionToken } from '@angular/core';

/** InjectionToken that can be used to specify the global choices options. */
export const CHOICES_CONFIG = new InjectionToken<Partial<Choices.Options>>('CHOICES_CONFIG');

/** InjectionToken that can be used to specify the global choices options for texts components. */
export const CHOICES_TEXT_CONFIG = new InjectionToken<Partial<Choices.Options>>('CHOICES_TEXT_CONFIG');
