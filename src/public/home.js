let mode = 'create';
const table = document.querySelector('#table');
const formTitle = document.querySelector('#formTitle');
const createButton = document.querySelector('#createButton');
const deploymentInput = document.querySelector('#deployment');
const hostInput = document.querySelector('#host');
const portInput = document.querySelector('#port');
const imageInput = document.querySelector('#image');
const imageElem = document.querySelector('#imageElem');

async function remove(deployment) {
  if (!confirm('Are you sure you want to delete this deployment?')) return;
  const { response } = await fetch('/route', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deployment }),
  });
  if (response) {
    Array.from(table.children)
      .find((row) => row.children[0].textContent === deployment)
      .remove();
    createMode();
    alert('Route successfully deleted');
  } else {
    alert('An error occurred with deleting this route');
  }
}

function edit(deployment) {
  mode = 'edit';
  formTitle.innerHTML = 'Update Deployment';
  createButton.style.display = 'inherit';
  console.log(
    Array.from(table.children).map((row) => row.children[0].textContent),
  );
  const row = Array.from(table.children).find(
    (row) => row.children[0].textContent === deployment,
  );
  deploymentInput.setAttribute('readonly', true);
  deploymentInput.value = row.children[0].textContent;
  hostInput.value = row.children[1].textContent;
  portInput.value = row.children[2].textContent;
  imageInput.value = '';
  imageElem.style.display = 'none';
}

function refresh(deployment) {
  if (!confirm('Are you sure you want to refresh this deployment?')) return;
  const { response } = fetch('/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deployment }),
  });
  if (response) {
    alert('Deployment successfully refreshed');
  } else {
    alert('An error occurred with refreshing this deployment');
  }
}

function createMode() {
  mode = 'create';
  formTitle.innerHTML = 'Create Deployment';
  createButton.style.display = 'none';
  deploymentInput.value = '';
  deploymentInput.removeAttribute('readonly');
  hostInput.value = '';
  portInput.value = 80;
  imageInput.value = '';
  imageElem.style.display = 'inherit';
}

async function submit() {
  if (mode === 'create') {
    if (!confirm('Are you sure you want to create this new deployment?')) {
      return;
    }
    const { response } = await fetch('/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment: deploymentInput.value,
        host: hostInput.value,
        port: portInput.value,
        image: imageInput.value,
      }),
    });
    if (response) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td
          class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
        >${deploymentInput.value}</td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
        >${hostInput.value}</td>
        <td
          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
        >${portInput.value}</td>
        <td
          class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
        >
          <button
            class="text-green-600 hover:text-green-700"
            onclick="refresh('${deploymentInput.value}')"
          >
            Refresh
          </button>
        </td>
        <td
          class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
        >
          <button
            class="text-blue-600 hover:text-blue-700"
            onclick="edit('${deploymentInput.value}')"
          >
            Edit
          </button>
        </td>
        <td
          class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
        >
          <button
            class="text-red-600 hover:text-red-700"
            onclick="remove('${deploymentInput.value}')"
          >
            Delete
          </button>
        </td>`;
      table.appendChild(row);
      alert('Route successfully created');
    } else {
      alert('An error occurred with creating this route');
    }
  } else {
    if (!confirm('Are you sure you want to update this deployment?')) {
      return;
    }
    const { response } = await fetch('/route', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment: deploymentInput.value,
        host: hostInput.value,
        port: portInput.value,
      }),
    });
    if (response) {
      const row = Array.from(table.children).find(
        (row) => row.children[0].textContent === deploymentInput.value,
      );
      row.children[1].textContent = hostInput.value;
      row.children[2].textContent = portInput.value;
      alert('Route successfully updated');
    } else {
      alert('An error occurred with updating this route');
    }
  }
  createMode();
}
