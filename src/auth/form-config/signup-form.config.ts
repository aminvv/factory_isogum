import { FormBuilder, Validators } from '@angular/forms';

export function createSignUpForm(fb: FormBuilder) {
  return fb.group({

    code: ['', Validators.required],
     mobile: [
      '',
      [
        Validators.required,
        Validators.pattern(/^09\d{8,9}$/),
        Validators.maxLength(11)
      ]
    ]

  });
}
