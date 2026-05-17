class FormHoneypot {
    constructor(fieldName = 'xoras_bot_check') {
        this.field = fieldName;
    }

    renderHtml() {
        return `<div style="position: absolute; left: -9999px; top: -9999px;" aria-hidden="true"><label for="${this.field}">Leave this field blank</label><input type="text" name="${this.field}" id="${this.field}" tabindex="-1" autocomplete="off" /></div>`;
    }

    validateSubmission(formData) {
        if (!formData) return { valid: false, error: 'NO_DATA' };
        const val = formData[this.field] || '';
        if (val.trim() !== '') return { valid: false, error: 'SPAM_TRAP_TRIGGERED' };
        return { valid: true, error: null };
    }
}

module.exports = FormHoneypot;
