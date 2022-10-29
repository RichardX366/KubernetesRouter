let mode = 'create';
const table = document.querySelector('#table');
const formTitle = document.querySelector('#formTitle');
const createButton = document.querySelector('#createButton');
const deploymentInput = document.querySelector('#deployment');
const hostInput = document.querySelector('#host');
const portInput = document.querySelector('#port');
const imageInput = document.querySelector('#image');
const envElement = document.querySelector('#env');

async function remove(deployment) {
  if (!confirm('Are you sure you want to delete this deployment?')) return;
  const { ok } = await fetch('/route', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deployment }),
  });
  if (ok) {
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
  const row = Array.from(table.children).find(
    (row) => row.children[0].textContent === deployment,
  );
  deploymentInput.setAttribute('disabled', true);
  deploymentInput.value = row.children[0].textContent;
  hostInput.value = row.children[1].textContent;
  portInput.value = row.children[2].textContent;
  imageInput.value = row.children[3].textContent;
  envElement.innerHTML = '';
  Object.entries(JSON.parse(row.children[4].textContent)).forEach((pair) =>
    newEnv(...pair),
  );
}

async function refresh(deployment) {
  if (!confirm('Are you sure you want to refresh this deployment?')) return;
  const { ok } = await fetch('/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deployment }),
  });
  if (ok) {
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
  deploymentInput.removeAttribute('disabled');
  hostInput.value = '';
  portInput.value = 80;
  imageInput.value = '';
  envElement.innerHTML = '';
}

async function submit() {
  if (mode === 'create') {
    if (!confirm('Are you sure you want to create this new deployment?')) {
      return;
    }
    const { ok } = await fetch('/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment: deploymentInput.value,
        host: hostInput.value,
        port: +portInput.value,
        image: imageInput.value,
        env: getEnv(),
      }),
    });
    if (ok) {
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
          class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
        >${imageInput.value}</td>
        <td class="hidden">${JSON.stringify(getEnv())}</td>
        <td
          class="flex gap-2 justify-end whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
        >
          <button
            class="text-green-600 hover:text-green-700"
            onclick="refresh('${deploymentInput.value}')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 013.7-3.7 48.678 48.678 0 017.324 0 4.006 4.006 0 013.7 3.7c.017.22.032.441.046.662M4.5 12l-3-3m3 3l3-3m12 3c0 1.232-.046 2.453-.138 3.662a4.006 4.006 0 01-3.7 3.7 48.657 48.657 0 01-7.324 0 4.006 4.006 0 01-3.7-3.7c-.017-.22-.032-.441-.046-.662M19.5 12l-3 3m3-3l3 3" />
            </svg>
          </button>
          <button
            class="text-blue-600 hover:text-blue-700"
            onclick="edit('${deploymentInput.value}')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
            </svg>
          <button
            class="text-red-600 hover:text-red-700"
            onclick="remove('${deploymentInput.value}')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
            </svg>
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
    const { ok } = await fetch('/route', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment: deploymentInput.value,
        host: hostInput.value,
        port: +portInput.value,
        image: imageInput.value,
        env: getEnv(),
      }),
    });
    if (ok) {
      const row = Array.from(table.children).find(
        (row) => row.children[0].textContent === deploymentInput.value,
      );
      row.children[1].textContent = hostInput.value;
      row.children[2].textContent = portInput.value;
      row.children[3].textContent = imageInput.value;
      row.children[4].textContent = JSON.stringify(getEnv());
      alert('Route successfully updated');
    } else {
      alert('An error occurred with updating this route');
    }
  }
  createMode();
}

async function logout() {
  if (!confirm('Are you sure you want to logout?')) return;
  const { ok } = await fetch('/logout', { method: 'POST' });
  if (ok) {
    window.location.reload();
  } else {
    alert('An error occurred with logging out');
  }
}

function newEnv(key = '', value = '') {
  const div = document.createElement('div');
  div.className = 'flex gap-2 my-1';
  div.innerHTML = `
    <styled-input class="w-full" placeholder="Key" value="${key}"></styled-input>
    <styled-input class="w-full" placeholder="Value" t="password" value="${value.replaceAll(
      '"',
      '&quot;',
    )}"></styled-input>
    <div onclick="this.parentElement.remove()" class="flex items-center text-gray-400 hover:text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6 cursor-pointer">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>`;
  envElement.appendChild(div);
}

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
function parseEnv(src) {
  const obj = [];
  let lines = src.toString();
  lines = lines.replace(/\r\n?/gm, '\n');
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = match[2] || '';
    value = value.trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2');
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n');
      value = value.replace(/\\r/g, '\r');
    }
    obj.push([key, value]);
  }
  return obj;
}

function getEnv() {
  const env = {};
  Array.from(envElement.children).forEach((div) => {
    const key = div.children[0].value;
    const value = div.children[1].value;
    env[key] = value;
  });
  return env;
}

function handleEnvUpload(input) {
  envElement.innerHTML = '';
  const file = input.files[0];
  const fileReader = new FileReader();
  fileReader.onload = () =>
    parseEnv(fileReader.result).forEach((pair) => newEnv(...pair));
  fileReader.readAsText(file);
  input.value = '';
}
