/* eslint @typescript-eslint/no-namespace: "off" */

/**
 * HTMLElement that implements the Constraint Validation API
 * @see: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#the_constraint_validation_api
 */
type HTMLElement_Validation =
  | HTMLButtonElement
  | HTMLFieldSetElement
  | HTMLInputElement
  | HTMLOutputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

type HTMLElementEventType = keyof HTMLElementEventMap;

/**
 * HTMLElement_Validation `validationMessage` (string)
 */
type validationMessage = HTMLElement_Validation["validationMessage"];

// ********************** //
// *** customValidity *** //
// ********************** //

/**
 * validator function
 * @param {HTMLElement_Validation} element The element to validate
 * @returns {validationMessage|Promise<validationMessage>} Empty string `""` when the element is valid, the i18n custom error `validationMessage` otherwise.
 */
export type validator = (
  element: HTMLElement_Validation
) => validationMessage | Promise<validationMessage>;
type validators = validator[];

/**
 * Reports an element custom validity
 * @async
 * @param {HTMLElement_Validation} element The element to report its custom validity
 * @param {validators} validators Custom validator functions
 * @returns {Promise<boolean>} Whether or not the element is valid
 * @fires invalid When the element is invalid
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity#examples
 */
export async function customValidityElement(
  element: HTMLElement_Validation,
  validators: validators
): Promise<boolean> {
  // reset element customValidity
  element.setCustomValidity("");

  // element has no built in error validationMessage
  // check for each custom validationMessage
  if (element.validationMessage === "") {
    for (const validator of validators) {
      const validationMessage = await validator(element);
      if (validationMessage !== "") {
        // Set the element error validationMessage
        element.setCustomValidity(validationMessage);
        break;
      }
    }
  }

  return element.reportValidity();
}

type customValidityOptions = {
  reportOn?: HTMLElementEventType;
};
type customValidityValue = validators | [...validators, customValidityOptions];
declare module "solid-js" {
  namespace JSX {
    interface DirectiveFunctions {
      customValidity: typeof customValidity;
    }
  }
}

/**
 * Whether or not a value is a plain object
 * @param {unknown} value The value to check for plain object type
 * @returns {boolean} Whether or not the value is a plain object
 */
function isObject(value: unknown): value is "object" {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

import type { Accessor } from "solid-js";
import { onCleanup } from "solid-js";

/**
 * Directive to report an element validity
 * @param {HTMLElement_Validation} element The element that uses the directive
 * @param {Accessor<customValidityValue>} accessor The custom validators, with optional event type
 * @example
 * - A `validator` must be Type
 *   ```ts
 *   (element: HTMLElement_Validation) => string
 *   ```
 * and returns an empty string `""` when the element is `valid`,
 * or returns a i18n `validationMessage`
 * - With `validator`s only
 *   ```jsx
 *   <input use:customValidity={[validator, validator]}>
 *   ```
 * - With `validator`s and options
 *   ```jsx
 *   <input use:customValidity={[validator, validator, {
 *     reportOn: "change" // default
 *   }]}>
 *   ```
 */
export function customValidity(
  element: HTMLElement_Validation,
  accessor: Accessor<customValidityValue>
): void {
  const value = accessor();
  // extract and removes the last element if it's an options Object
  const hasOptions = isObject(value.at(-1));
  const options = hasOptions ? (value.pop() as customValidityOptions) : {};
  const validators = value as validator[];
  const { reportOn = "change" } = options;

  const reportListener: EventListener = async () => {
    await customValidityElement(element, validators);
  };
  element.addEventListener(reportOn, reportListener);
  onCleanup(() => {
    element.removeEventListener(reportOn, reportListener);
  });
}

// ************************* //
// *** validationMessage *** //
// ************************* //
/**
 * Reset an element validity
 * @param element The element to reset the validity
 */
export function resetValidityElement(element: HTMLElement_Validation) {
  element.setCustomValidity("");
  element.reportValidity();
}

import type { Setter } from "solid-js";
type validationMessageSetter = Setter<validationMessage>;
type validationMessageOptions = {
  resetOn?: HTMLElementEventType;
  setOn?: HTMLElementEventType;
};
type validationMessageValue =
  | validationMessageSetter
  | [validationMessageSetter, validationMessageOptions];
declare module "solid-js" {
  namespace JSX {
    interface DirectiveFunctions {
      validationMessage: typeof validationMessage;
    }
  }
}

/**
 * Directive to set an element `validationMessage`
 * @param {HTMLElement_Validation} element The element that uses the directive
 * @param {Accessor<validationMessageValue>} accessor The `validationMessage` setter, with optional event types
 * @example
 * - A `validationMessageSetter` must be Type
 *   ```ts
 *   Setter<string>
 *   ```
 * - A `validationMessageOptions` must be Type
 *   ```ts
 *   {
 *     resetOn?: keyof HTMLElementEventMap,
 *     setOn?: keyof HTMLElementEventMap
 *   }
 *   ```
 * - With `validationMessageSetter` only
 *   ```jsx
 *   <input use:validationMessage={validationMessageSetter}>
 *   ```
 * - With `validationMessageSetter` and options
 *   ```jsx
 *   <input use:validationMessage={[validationMessageSetter, {
 *     resetOn?: "change", // default
 *     setOn?: "invalid" // default
 *   }]}>
 *   ```
 */
export function validationMessage(
  element: HTMLElement_Validation,
  accessor: Accessor<validationMessageValue>
): void {
  const value = accessor();
  const hasOptions = Array.isArray(value);
  const [set, options] = hasOptions ? value : [value, {}];
  const { resetOn = "change", setOn = "invalid" } = options;

  const setListener: EventListener = () => {
    set(element.validationMessage);
  };

  const resetListener: EventListener = () => {
    resetValidityElement(element);
    set(element.validationMessage);
  };

  element.addEventListener(setOn, setListener);
  element.addEventListener(resetOn, resetListener);
  onCleanup(() => {
    element.removeEventListener(setOn, setListener);
    element.removeEventListener(resetOn, resetListener);
  });
}

// ****************** //
// *** validation *** //
// ****************** //
type validationOptions = validationMessageOptions & customValidityOptions;
type validationValue =
  | validationMessageValue
  | [validationMessageSetter, validators]
  | [validationMessageSetter, validators, validationOptions];
declare module "solid-js" {
  namespace JSX {
    interface DirectiveFunctions {
      validation: typeof validation;
    }
  }
}

/**
 * Directive to check an element validation
 * @param {HTMLElement_Validation} element The element that uses the directive
 * @param {Accessor<validationValue>} accessor The `validationMessage` setter, with optional event types
 * @example
 * - A `validationMessageSetter` must be Type
 *   ```ts
 *   Setter<string>
 *   ```
 * - A `validator` must be Type
 *   ```ts
 *   (element: HTMLElement_Validation) => string
 *   ```
 * and returns an empty string `""` when the element is `valid`,
 * or returns a i18n `validationMessage`
 * - A `validationOptions` must be Type
 *   ```ts
 *   {
 *     resetOn?: keyof HTMLElementEventMap,
 *     setOn?: keyof HTMLElementEventMap,
 *     reportOn?: keyof HTMLElementEventMap,
 *   }
 *   ```
 * - With `validationMessageSetter` only
 *   ```jsx
 *   <input use:validation={validationMessageSetter}>
 *   ```
 * - With `validationMessageSetter` and options
 *   ```jsx
 *   <input use:validation={[validationMessageSetter, {
 *     resetOn?: "change", // default
 *     setOn?: "invalid", // default
 *   }]}>
 *   ```
 * - With `validationMessageSetter`, `validator`s and options
 *   ```jsx
 *   <input use:validation={[validationMessageSetter, [validator, validator], {
 *     resetOn?: "change", // default
 *     setOn?: "invalid", // default
 *     reportOn?: "change", // default
 *   }]}>
 *   ```
 */
export function validation(
  element: HTMLElement_Validation,
  accessor: Accessor<validationValue>
): void {
  const value = accessor();
  const hasOptions = Array.isArray(value) && isObject(value.at(-1));
  const options = hasOptions ? (value.pop() as validationOptions) : {};

  const [set, validators = []] = Array.isArray(value)
    ? (value as [validationMessageSetter, validators])
    : [value];
  const { resetOn, setOn, reportOn } = options;

  validationMessage(element, () => [set, { resetOn, setOn }]);
  customValidity(element, () => [...validators, { reportOn }]);
}
