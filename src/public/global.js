class StyledInput extends HTMLInputElement {
  constructor() {
    super();
    const label = document.createElement('label');
    label.setAttribute('for', this.getAttribute('label').toLowerCase());
    label.className =
      'block text-sm font-medium text-gray-700 mb-1 select-none';
    label.innerText = this.getAttribute('label');
    this.parentElement.insertBefore(label, this);
    if (this.getAttribute('description')) {
      const description = document.createElement('p');
      description.className = 'mt-1 text-sm text-gray-500 select-none';
      description.innerText = this.getAttribute('description');
      this.parentElement.appendChild(description);
    }
    this.id = this.getAttribute('label').toLowerCase();
    this.type = this.type || 'text';
    this.className =
      'shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md';
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        eval(this.getAttribute('onenter'));
      }
    });
  }
}

customElements.define('styled-input', StyledInput, { extends: 'input' });
