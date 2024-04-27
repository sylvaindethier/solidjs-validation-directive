# SolidJS `use:validation` directive

## Validator function

Both `customValidity` and `validation` directives must / can be used with custom validator(s).

A `validator` is a _sync_ or _async_ function that takes an HTMLElement that implements the [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#the_constraint_validation_api) and returns an (i18n) error validation message or an empty string when valid.

Refered here as `HTMLElement_Validation`, the element can be either a `HTMLButtonElement`, `HTMLFieldSetElement`, `HTMLInputElement`, `HTMLOutputElement`, `HTMLSelectElement`, or `HTMLTextAreaElement`.

```ts
/**
 * validator function
 * @param {HTMLElement_Validation} element The element to validate
 * @returns {string|Promise<string>} Empty string `""` when the element is valid, the i18n custom error `validationMessage` otherwise.
 */
type validator = (element: HTMLElement_Validation) => string | Promise<string>;
```

Example of a _sync_ `validator` that constraint an `input` element to have a value with a non empty string:

```ts
function hasNonEmptyValue(element: HTMLElement_Validation): string {
  const value = (element as HTMLInputElement).value.trim();
  const errored = value === "";
  return errored ? "Text must not be empty" : "";
}
```

## Usage of the `customValidity` directive

The `reportValidity` function is called upon the `reportOn` event type i.e `change` (default), `blur`, `input`.

In the example below, we use the directive on an `input` HTMLInputElement.

- With `validator`s only

  ```jsx
  <input use:customValidity={[validator, validator]}>
  ```

- With `validator`s and event options

  ```jsx
  <input use:customValidity={[validator, validator, {
    reportOn: "change" // default
  }]}>
  ```

## Usage of the `validationMessage` directive

This directive is useful to synchronize an element `validationMessage` with a `Signal<string>`.

A `validationMessageSetter` must be Type

  ```ts
  Setter<string>
  ```

A `validationMessageOptions` must be Type

  ```ts
  {
    resetOn?: keyof HTMLElementEventMap,
    setOn?: keyof HTMLElementEventMap,
  }
  ```

- With `validationMessageSetter` only

  ```jsx
  <input use:validationMessage={validationMessageSetter}>
  ```

- With `validationMessageSetter` and options

  ```jsx
  <input use:validationMessage={[validationMessageSetter, {
    resetOn?: "change", // default
    setOn?: "invalid" // default
  }]}>
  ```

## Usage of the `validation` directive

This directive is the combination of the `customValidty` and `validationMessage` directive.

A `validationOptions` must be Type

```ts
{
  resetOn?: keyof HTMLElementEventMap,
  setOn?: keyof HTMLElementEventMap,
  reportOn?: keyof HTMLElementEventMap,
}
```

- With `validationMessageSetter` only

  ```jsx
  <input use:validation={validationMessageSetter}>
  ```

- With `validationMessageSetter` and options
  ```jsx
  <input use:validation={[validationMessageSetter, {
    resetOn?: "change", // default
    setOn?: "invalid", // default
  }]}>
  ```

- With `validationMessageSetter`, `validator`s and options

  ```jsx
  <input use:validation={[validationMessageSetter, [validator, validator], {
    resetOn?: "change", // default
    setOn?: "invalid", // default
    reportOn?: "change", // default
  }]}>
  ```
