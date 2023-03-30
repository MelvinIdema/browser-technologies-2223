const submitButton = document.querySelector("#submit");
const nextButton = document.querySelector("#next")
const prevButton = document.querySelector("#prev")

/**
 * FORM VALIDATION
 */
function addErrorMessage(input, message) {
    if (input.nextElementSibling) return;

    input.insertAdjacentHTML('afterend', `<strong class="input-error" id="error-${input.name}">${message}</strong>`);
    input.attributes.ariaInvalid = true;
    input.attributes.ariaDescribedBy = `error-${input.name}`;
    nextButton.disabled = true;
}

function removeErrorMessage(input) {
    if (input.nextElementSibling) {
        input.nextElementSibling.remove();
        nextButton.disabled = false;
    }
}

const requiredInputs = document.querySelectorAll('input:required');
const studentNumber = document.querySelector('#student_number');

requiredInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.value.length === 0) return addErrorMessage(input, 'Dit veld is vereist');
        removeErrorMessage(input);
    });
});

studentNumber.addEventListener('input', () => {
    if (!studentNumber.value.match(/^(4|5)/) || studentNumber.value.length !== 9 && studentNumber.value.length !== 0) {
        addErrorMessage(studentNumber, 'Vul een geldig studentennummer in');
    } else {
        removeErrorMessage(studentNumber);
    }
});

function validateRequiredInputs() {
    requiredInputs.forEach(input => {
        if (input.value.length === 0) return addErrorMessage(input, 'Dit veld is vereist');
        removeErrorMessage(input);
    });
}

function validateStudentNumber() {
    if (!studentNumber.value.match(/^(5|6)/) || studentNumber.value.length !== 9 && studentNumber.value.length !== 0) {
        addErrorMessage(studentNumber, 'Vul een geldig studentennummer in');
    } else {
        removeErrorMessage(studentNumber);
    }
}

validateRequiredInputs();
validateStudentNumber();

/**
 * MULTI STEP FORM
 */
function makeFormMultiStep() {
    const fieldSets = document.querySelectorAll("fieldset:not(:first-of-type)");
    const stepsList = document.querySelector("#steps");

    stepsList.classList.remove('hidden');

    fieldSets.forEach((fieldSet, index) => {
        let step = document.createElement("li");
        step.classList.add("step");
        step.innerText = index + 2;
        stepsList.appendChild(step);
    });

    nextButton.classList.remove("hidden");
    nextButton.ariaHidden = "false";
    prevButton.ariaHidden = "false";
    submitButton.classList.add("hidden");

    fieldSets.forEach(fieldSet => fieldSet.classList.add("hidden"));

    nextButton.addEventListener("click", () => {
        let currentFieldSet = document.querySelector("fieldset:not(.hidden)");
        let nextFieldSet = document.querySelector("fieldset:not(.hidden) + fieldset.hidden");

        if(currentFieldSet.querySelector("input:invalid")) return;

        // Remove the 'active' class from the previous step and add it to the next one
        let currentStep = document.querySelector("#steps li.active");
        let nextStep = currentStep.nextElementSibling;
        currentStep.classList.remove("active");
        nextStep.classList.add("active");

        // Add the 'done' class to the previous step
        currentStep.classList.add("done");

        currentFieldSet.classList.add("hidden");
        nextFieldSet.classList.remove("hidden");
        prevButton.classList.remove("hidden");
        prevButton.ariaHidden = "false";

        // If the current fieldset is the last one, hide the next button and show the submit button
        nextFieldSet = document.querySelector("fieldset:not(.hidden) + fieldset.hidden");
        if (!nextFieldSet) {
            nextButton.classList.add("hidden");
            nextButton.ariaHidden = "true";
            submitButton.classList.remove("hidden");
            return;
        }
    });

    prevButton.addEventListener("click", () => {
        let currentFieldSet = document.querySelector("fieldset:not(.hidden)");
        let prevFieldSet = currentFieldSet.previousElementSibling;

        currentFieldSet.classList.add("hidden");
        prevFieldSet.classList.remove("hidden");
        nextButton.classList.remove("hidden");
        submitButton.classList.add("hidden");

        // Remove the 'active' class from the next step and add it to the previous one
        let currentStep = document.querySelector("#steps li.active");
        let prevStep = currentStep.previousElementSibling;
        currentStep.classList.remove("active");
        prevStep.classList.add("active");
        prevStep.classList.remove("done");

        // If the current fieldset is the first one, hide the prev button
        currentFieldSet = document.querySelector("fieldset:not(.hidden)");
        prevFieldSet = currentFieldSet.previousElementSibling;

        if (!prevFieldSet) {
            prevButton.classList.add("hidden");
            prevButton.ariaHidden = "true";
            return;
        }
    });
}

function makeFormStepsSaveable() {
    // Check if there is at least one item in localStorage beginning with "fieldSetData-"
    let hasSavedData = false;

    // Check if there are items beginning with "fieldSetData-" in localStorage and if so console log them
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("fieldSetData-")) {
            hasSavedData = true;

            const fieldSetData = JSON.parse(localStorage.getItem(localStorage.key(i)));
            const fieldSet = document.querySelector(`#${localStorage.key(i).replace("fieldSetData-", "")}`);

            fieldSetData.forEach(data => {
                fieldSet.querySelectorAll('input').forEach(input => {
                    if (input.name === data.name) {
                        input.value = data.value;
                        console.log(input.name, data.value);
                    }
                });
            })
        }
    }

    if(hasSavedData) {
        const snackbar = document.createElement("div");
        snackbar.classList.add("snackbar");
        snackbar.innerText = "Er zijn opgeslagen gegevens gevonden en automatisch hersteld.";
        document.body.appendChild(snackbar);
        snackbar.classList.add("show");
        setTimeout(() => snackbar.classList.remove("show"), 2900);
    }

    // Save the current step to local storage
    document.querySelector("form").addEventListener("input", () => {
        let currentFieldSet = document.querySelector("fieldset:not(.hidden)");
        let currentStep = document.querySelector("#steps li.active");

        localStorage.setItem("currentStep", currentStep.innerText);

        const fieldSetData = [...currentFieldSet.querySelectorAll('input')].map(input => {
            return {
                name: input.name,
                value: input.value
            };
        });

        localStorage.setItem(`fieldSetData-${currentFieldSet.id}`, JSON.stringify(fieldSetData));
    });
}

if (document.querySelector(":not(body)")) makeFormMultiStep();
if(window.localStorage) makeFormStepsSaveable();