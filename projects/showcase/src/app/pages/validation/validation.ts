import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { FormField, email, form, required, validate } from '@angular/forms/signals';
import { DatePicker } from '@swipergy/swipyui/datepicker';
import { InputText } from '@swipergy/swipyui/inputtext';
import { DocsSection } from '../../shared/docs-section';

/** Custom reactive validator: rejects one specific name. */
function forbiddenName(name: string) {
  return (control: AbstractControl): ValidationErrors | null =>
    typeof control.value === 'string' && control.value.trim().toLowerCase() === name
      ? { forbiddenName: { value: control.value } }
      : null;
}

const REACTIVE = `// Built-in and custom validators on plain FormControls — the controls
// pick the validity up automatically and turn red after the first blur.
function forbiddenName(name: string) {
  return (control: AbstractControl): ValidationErrors | null =>
    control.value?.trim().toLowerCase() === name
      ? { forbiddenName: { value: control.value } }
      : null;
}

readonly name = new FormControl('', [Validators.required, forbiddenName('admin')]);
readonly birthday = new FormControl<Date | null>(null, Validators.required);

<input syuiInputText placeholder="Name" [formControl]="name" />
<syui-datepicker placeholder="Birthday" [formControl]="birthday" />

@if (name.touched && name.hasError('required')) { <small>Name is required.</small> }
@if (name.touched && name.hasError('forbiddenName')) { <small>This name is not allowed.</small> }`;

const SIGNAL = `// Signal forms: rules live in the schema; [formField] binds value,
// invalid and touched into the control automatically.
readonly model = signal({ username: '', email: '' });
readonly f = form(this.model, (path) => {
  required(path.username, { message: 'Username is required.' });
  validate(path.username, ({ value }) =>
    value().includes(' ')
      ? { kind: 'noSpaces', message: 'Spaces are not allowed.' }  // custom validation
      : undefined,
  );
  required(path.email, { message: 'E-mail is required.' });
  email(path.email, { message: 'Not a valid e-mail address.' });
});

<input syuiInputText placeholder="Username" [formField]="f.username" />
<input syuiInputText placeholder="E-mail" [formField]="f.email" />

@for (error of f.username().errors(); track error.kind) {
  <small>{{ error.message }}</small>
}`;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormField, InputText, DatePicker, DocsSection, JsonPipe],
  styles: `
    .validation-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 20rem;
    }
    .validation-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .validation-error {
      color: var(--syui-danger-color);
      font-size: 0.875rem;
    }
  `,
  template: `
    <h1>Validation</h1>
    <p class="docs-lead">
      SwipyUI form controls pick their invalid state up from whichever forms API they are bound
      to: validators of reactive and template-driven forms (built-in and custom alike) via the
      attached control, and signal forms via the <code>[formField]</code> binding. Invalid styling
      appears after the first blur — no extra wiring needed.
    </p>

    <docs-section
      title="Reactive forms"
      [code]="reactive"
      language="typescript"
      description="Validators.required plus a custom forbiddenName validator; try leaving the name empty or typing 'admin', then blur."
    >
      <div class="validation-form">
        <div class="validation-field">
          <input syuiInputText fluid placeholder="Name (try 'admin')" [formControl]="name" />
          @if (name.touched && name.hasError('required')) {
            <small class="validation-error">Name is required.</small>
          }
          @if (name.touched && name.hasError('forbiddenName')) {
            <small class="validation-error">This name is not allowed.</small>
          }
        </div>
        <div class="validation-field">
          <syui-datepicker fluid placeholder="Birthday" [formControl]="birthday" />
          @if (birthday.touched && birthday.hasError('required')) {
            <small class="validation-error">Birthday is required.</small>
          }
        </div>
      </div>
    </docs-section>

    <docs-section
      title="Signal forms"
      [code]="signalForms"
      language="typescript"
      description="Rules are declared in the form schema — required and email built in, a custom rule via validate(). Error messages come from the field state."
    >
      <div class="validation-form">
        <div class="validation-field">
          <input syuiInputText fluid placeholder="Username (no spaces)" [formField]="f.username" />
          @if (f.username().touched()) {
            @for (error of f.username().errors(); track error.kind) {
              <small class="validation-error">{{ error.message }}</small>
            }
          }
        </div>
        <div class="validation-field">
          <input syuiInputText fluid placeholder="E-mail" [formField]="f.email" />
          @if (f.email().touched()) {
            @for (error of f.email().errors(); track error.kind) {
              <small class="validation-error">{{ error.message }}</small>
            }
          }
        </div>
        <small class="docs-muted">
          valid: {{ f().valid() }} — value: {{ model() | json }}
        </small>
      </div>
    </docs-section>
  `,
})
export class Validation {
  readonly reactive = REACTIVE;
  readonly signalForms = SIGNAL;

  readonly name = new FormControl('', [Validators.required, forbiddenName('admin')]);
  readonly birthday = new FormControl<Date | null>(null, Validators.required);

  readonly model = signal({ username: '', email: '' });
  readonly f = form(this.model, (path) => {
    required(path.username, { message: 'Username is required.' });
    validate(path.username, ({ value }) =>
      value().includes(' ') ? { kind: 'noSpaces', message: 'Spaces are not allowed.' } : undefined,
    );
    required(path.email, { message: 'E-mail is required.' });
    email(path.email, { message: 'Not a valid e-mail address.' });
  });
}
